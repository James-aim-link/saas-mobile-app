
import React, { useEffect, useState, useCallback } from 'react';
import {
    Box, Heading, Text, VStack, Spinner, Center,
    Pressable, HStack, Badge, Progress, Avatar,
    ScrollView, FlatList, Icon, useToast, Actionsheet,
    useDisclose, Modal, FormControl, Input, Button
} from 'native-base';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
    getProjectList, createProject, addCollect, cancelCollect,
    updateProjectField, deleteProject, archiveProject, unarchiveProject
} from '../api/project_v2';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

const PC_BLUE = '#1890ff';

const ProjectScreen = () => {
    const navigation = useNavigation();
    const toast = useToast();
    const { isOpen: isActionOpen, onOpen: onActionOpen, onClose: onActionClose } = useDisclose();
    const { isOpen: isModalOpen, onOpen: onModalOpen, onClose: onModalClose } = useDisclose();

    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('myJoin');
    const [selectedProject, setSelectedProject] = useState(null);
    const [projectName, setProjectName] = useState('');
    const [modalMode, setModalMode] = useState('create');

    const tabs = [
        { key: 'myJoin', label: 'Joined' },
        { key: 'myResponse', label: 'Responsible' },
        { key: 'myManager', label: 'Managed' },
        { key: 'collectProject', label: 'Starred' },
        { key: 'allProject', label: 'All' },
        { key: 'archived', label: 'Archived' },
    ];

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const res = await getProjectList({
                pageNo: 1,
                pageSize: 50,
                menuType: activeTab
            });
            setProjects(res?.list || []);
        } catch (error) {
            console.error('Fetch projects failed', error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchProjects();
        }, [activeTab])
    );

    const handleCreate = async () => {
        if (!projectName) return;
        try {
            await createProject({ proName: projectName });
            toast.show({ description: "Project created" });
            onModalClose();
            setProjectName('');
            fetchProjects();
        } catch (e) {
            toast.show({ description: "Failed to create", status: "error" });
        }
    };

    const handleRename = async () => {
        if (!projectName || !selectedProject) return;
        try {
            await updateProjectField({
                id: selectedProject.id,
                fieldName: 'proName',
                fieldValue: projectName
            });
            toast.show({ description: "Project renamed" });
            onModalClose();
            fetchProjects();
        } catch (e) {
            toast.show({ description: "Rename failed", status: "error" });
        }
    };

    const handleToggleStar = async () => {
        if (!selectedProject) return;
        try {
            if (activeTab === 'collectProject' || selectedProject.isStar) {
                await cancelCollect(selectedProject.id);
                toast.show({ description: "Unstarred" });
            } else {
                await addCollect(selectedProject.id);
                toast.show({ description: "Starred" });
            }
            onActionClose();
            fetchProjects();
        } catch (e) {
            toast.show({ description: "Operation failed", status: "error" });
        }
    };

    const handleDelete = async () => {
        if (!selectedProject) return;
        try {
            await deleteProject(selectedProject.id);
            toast.show({ description: "Project deleted" });
            onActionClose();
            fetchProjects();
        } catch (e) {
            toast.show({ description: "Delete failed", status: "error" });
        }
    };

    const handleArchive = async () => {
        if (!selectedProject) return;
        try {
            await archiveProject(selectedProject.id);
            toast.show({ description: "Project archived" });
            onActionClose();
            fetchProjects();
        } catch (e) {
            toast.show({ description: "Archive failed", status: "error" });
        }
    };

    const handleUnarchive = async () => {
        if (!selectedProject) return;
        try {
            await unarchiveProject(selectedProject.id);
            toast.show({ description: "Project unarchived" });
            onActionClose();
            fetchProjects();
        } catch (e) {
            toast.show({ description: "Unarchive failed", status: "error" });
        }
    };

    const openAction = (project) => {
        setSelectedProject(project);
        onActionOpen();
    };

    const renderProjectItem = ({ item }) => {
        const progress = item.percent || 0;
        const isCompleted = item.projectStateName === 'Completed' || item.projectState === 'finish';

        const name = item.proName || item.proname || item.pro_name || 'Untitled Project';
        const code = item.projectCode || item.procode || 'NO CODE';
        const manager = item.managerName || item.manager_name || 'OWNER';
        const stateName = item.projectStateName || item.state_name || (isCompleted ? "Completed" : "Ongoing");

        return (
            <Pressable
                onPress={() => navigation.navigate('TaskList', { projectId: item.id, projectName: name })}
                onLongPress={() => openAction(item)}
                mb="4"
            >
                <Box bg="white" p="4" rounded="lg" shadow={1} borderLeftWidth={4} borderLeftColor={isCompleted ? "emerald.500" : PC_BLUE}>
                    <HStack justifyContent="space-between" alignItems="flex-start" mb="2">
                        <VStack flex={1}>
                            <Heading size="xs" color="coolGray.800" numberOfLines={1}>
                                {name}
                            </Heading>
                            <Text fontSize="10px" color="coolGray.400">
                                {code} • {manager}
                            </Text>
                        </VStack>
                        <HStack space={2} alignItems="center">
                            <Badge colorScheme={isCompleted ? "emerald" : "blue"} variant="subtle" rounded="sm" _text={{ fontSize: "10px" }}>
                                {stateName}
                            </Badge>
                            <Pressable onPress={() => openAction(item)}>
                                <Icon as={MaterialCommunityIcons} name="dots-vertical" size="xs" color="coolGray.300" />
                            </Pressable>
                        </HStack>
                    </HStack>

                    <VStack space={2} mt="2">
                        <HStack justifyContent="space-between">
                            <Text fontSize="10px" color="coolGray.400">Progress</Text>
                            <Text fontSize="10px" color={PC_BLUE} fontWeight="bold">{progress}%</Text>
                        </HStack>
                        <Progress value={progress} colorScheme="blue" size="2xs" bg="blue.50" rounded="full" />
                    </VStack>
                </Box>
            </Pressable>
        );
    };

    return (
        <Box flex={1} bg="coolGray.50" safeAreaTop>
            <Box bg="white" px="5" py="4" borderBottomWidth={1} borderBottomColor="coolGray.100">
                <HStack justifyContent="space-between" alignItems="center">
                    <Heading size="md">Projects</Heading>
                    <HStack space={2}>
                        <Pressable p="2" onPress={fetchProjects}>
                            <Icon as={MaterialCommunityIcons} name="refresh" size="sm" color={PC_BLUE} />
                        </Pressable>
                        <Pressable p="2" onPress={() => { setModalMode('create'); setProjectName(''); onModalOpen(); }}>
                            <Icon as={MaterialCommunityIcons} name="plus" size="sm" color={PC_BLUE} />
                        </Pressable>
                    </HStack>
                </HStack>
            </Box>

            <Box bg="white">
                <ScrollView horizontal showsHorizontalScrollIndicator={false} px="3" py="2">
                    <HStack space={2}>
                        {tabs.map(tab => (
                            <Pressable
                                key={tab.key}
                                onPress={() => setActiveTab(tab.key)}
                                px="4" py="1.5" rounded="full"
                                bg={activeTab === tab.key ? PC_BLUE : "coolGray.100"}
                            >
                                <Text fontSize="xs" fontWeight="600" color={activeTab === tab.key ? "white" : "coolGray.500"}>
                                    {tab.label}
                                </Text>
                            </Pressable>
                        ))}
                    </HStack>
                </ScrollView>
            </Box>

            {loading ? (
                <Center flex={1}><Spinner color={PC_BLUE} /></Center>
            ) : (
                <FlatList
                    data={projects}
                    renderItem={renderProjectItem}
                    keyExtractor={item => item.id}
                    px="4" py="4"
                    ListEmptyComponent={
                        <Center mt="20">
                            <Icon as={MaterialCommunityIcons} name="folder-open-outline" size="6xl" color="coolGray.100" />
                            <Text color="coolGray.400">No projects found</Text>
                        </Center>
                    }
                />
            )}

            <Actionsheet isOpen={isActionOpen} onClose={onActionClose}>
                <Actionsheet.Content>
                    <Box w="100%" h={60} px={4} justifyContent="center">
                        <Text fontSize="16" color="gray.500" fontWeight="bold">
                            {selectedProject?.proName || selectedProject?.proname || 'Project Actions'}
                        </Text>
                    </Box>
                    <Actionsheet.Item startIcon={<Icon as={MaterialCommunityIcons} name="star-outline" />} onPress={handleToggleStar}>
                        {selectedProject?.isStar ? 'Unstar Project' : 'Star Project'}
                    </Actionsheet.Item>
                    <Actionsheet.Item startIcon={<Icon as={MaterialCommunityIcons} name="pencil" />} onPress={() => { setModalMode('edit'); setProjectName(selectedProject.proName || selectedProject.proname); onActionClose(); onModalOpen(); }}>
                        Rename
                    </Actionsheet.Item>

                    {activeTab === 'archived' ? (
                        <Actionsheet.Item startIcon={<Icon as={MaterialCommunityIcons} name="package-up" />} onPress={handleUnarchive}>
                            Unarchive Project
                        </Actionsheet.Item>
                    ) : (
                        <Actionsheet.Item startIcon={<Icon as={MaterialCommunityIcons} name="package-down" />} onPress={handleArchive}>
                            Archive Project
                        </Actionsheet.Item>
                    )}

                    <Actionsheet.Item
                        startIcon={<Icon as={MaterialCommunityIcons} name="delete" color="red.500" />}
                        _text={{ color: "red.500" }}
                        onPress={handleDelete}
                    >
                        Delete Project
                    </Actionsheet.Item>
                </Actionsheet.Content>
            </Actionsheet>

            <Modal isOpen={isModalOpen} onClose={onModalClose}>
                <Modal.Content>
                    <Modal.Header>{modalMode === 'create' ? 'New Project' : 'Rename Project'}</Modal.Header>
                    <Modal.Body>
                        <FormControl>
                            <FormControl.Label>Name</FormControl.Label>
                            <Input value={projectName} onChangeText={setProjectName} autoFocus />
                        </FormControl>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button.Group space={2}>
                            <Button variant="ghost" colorScheme="blueGray" onPress={onModalClose}>Cancel</Button>
                            <Button bg={PC_BLUE} onPress={modalMode === 'create' ? handleCreate : handleRename}>
                                {modalMode === 'create' ? 'Create' : 'Save'}
                            </Button>
                        </Button.Group>
                    </Modal.Footer>
                </Modal.Content>
            </Modal>
        </Box>
    );
};

export default ProjectScreen;
