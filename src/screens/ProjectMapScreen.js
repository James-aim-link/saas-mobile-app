
import React, { useState, useEffect } from 'react';
import {
    Box, Text, VStack, HStack, FlatList, Pressable,
    Heading, Icon, Spinner, Center, Divider, Badge,
    Actionsheet, useDisclose, Modal, FormControl, Input, Button, useToast
} from 'native-base';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getMindMapListByUser, addMindMap, updateMindMap, deleteMindMap, getMindLogList } from '../api/mind_v2';
import { useNavigation } from '@react-navigation/native';

const PC_BLUE = '#1890ff';

const ProjectMapScreen = () => {
    const navigation = useNavigation();
    const toast = useToast();
    const { isOpen: isActionOpen, onOpen: onActionOpen, onClose: onActionClose } = useDisclose();
    const { isOpen: isModalOpen, onOpen: onModalOpen, onClose: onModalClose } = useDisclose();

    const [maps, setMaps] = useState([]);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewType, setViewType] = useState('list');
    const [selectedMap, setSelectedMap] = useState(null);
    const [mapName, setMapName] = useState('');
    const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const mapRes = await getMindMapListByUser();
            setMaps(mapRes || []);
            const logRes = await getMindLogList({ pageNo: 1, pageSize: 15 });
            setLogs(logRes.list || []);
        } catch (error) {
            console.error('ProjectMap fetchData error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!mapName) return;
        try {
            await addMindMap({
                mapCatalogName: mapName,
                parentId: '0',
                catalogType: 'map'
            });
            toast.show({ description: "Map created successfully" });
            onModalClose();
            setMapName('');
            fetchData();
        } catch (e) {
            toast.show({ description: "Failed to create map", status: "error" });
        }
    };

    const handleRename = async () => {
        if (!mapName || !selectedMap) return;
        try {
            await updateMindMap({
                id: selectedMap.id,
                mapCatalogName: mapName
            });
            toast.show({ description: "Map renamed successfully" });
            onModalClose();
            setMapName('');
            fetchData();
        } catch (e) {
            toast.show({ description: "Failed to rename map", status: "error" });
        }
    };

    const handleDelete = async () => {
        if (!selectedMap) return;
        try {
            await deleteMindMap({ id: selectedMap.id });
            toast.show({ description: "Map deleted successfully" });
            onActionClose();
            fetchData();
        } catch (e) {
            toast.show({ description: "Failed to delete map", status: "error" });
        }
    };

    const openAction = (map) => {
        setSelectedMap(map);
        onActionOpen();
    };

    const openEditModal = () => {
        setModalMode('edit');
        setMapName(selectedMap.mapCatalogName || selectedMap.proName);
        onActionClose();
        onModalOpen();
    };

    const openCreateModal = () => {
        setModalMode('create');
        setMapName('');
        onModalOpen();
    };

    const renderMapItem = ({ item }) => (
        <Pressable
            onPress={() => navigation.navigate('MapDetail', {
                mapId: item.id,
                mapName: item.mapCatalogName || item.proName
            })}
            onLongPress={() => openAction(item)}
            mb="3"
        >
            <Box
                bg="white"
                p="4"
                rounded="lg"
                shadow={1}
                borderLeftWidth={4}
                borderLeftColor={PC_BLUE}
            >
                <HStack justifyContent="space-between" alignItems="center">
                    <VStack flex={1} space={1}>
                        <Heading size="xs" color="coolGray.800">
                            {item.mapCatalogName || item.proName || 'Untitled Map'}
                        </Heading>
                        <HStack space={2} alignItems="center">
                            <Badge colorScheme="blue" variant="subtle" rounded="sm" _text={{ fontSize: '10px' }}>
                                DRAFT
                            </Badge>
                            <Text fontSize="10px" color="coolGray.400">
                                {item.createTime || 'Recently added'}
                            </Text>
                        </HStack>
                    </VStack>
                    <Pressable p="2" onPress={() => openAction(item)}>
                        <Icon as={MaterialCommunityIcons} name="dots-vertical" size="sm" color="coolGray.400" />
                    </Pressable>
                </HStack>
            </Box>
        </Pressable>
    );

    const renderLogItem = ({ item }) => (
        <Box borderLeftWidth={1} borderLeftColor="coolGray.200" ml="4" pl="6" pb="8">
            <Center position="absolute" left="-10px" top="0" w="20px" h="20px" rounded="full" bg="white" zIndex={1}>
                <Box w="10px" h="10px" rounded="full" bg={PC_BLUE} />
            </Center>
            <VStack space={2}>
                <HStack justifyContent="space-between">
                    <Text fontWeight="bold" color="coolGray.700">{item.operatorName}</Text>
                    <Text fontSize="10px" color="coolGray.400">{item.createTime}</Text>
                </HStack>
                <Box bg="coolGray.50" p="3" rounded="md">
                    <Text fontSize="xs" color="coolGray.600">{item.content}</Text>
                </Box>
            </VStack>
        </Box>
    );

    return (
        <Box flex={1} bg="coolGray.50" safeAreaTop>
            <VStack p="4" space={4} flex={1}>
                <HStack justifyContent="space-between" alignItems="center">
                    <Heading size="md">Project Maps</Heading>
                    <HStack space={2}>
                        <Pressable p="2" onPress={fetchData}>
                            <Icon as={MaterialCommunityIcons} name="refresh" size="sm" color={PC_BLUE} />
                        </Pressable>
                        <Pressable p="2" onPress={openCreateModal}>
                            <Icon as={MaterialCommunityIcons} name="plus" size="sm" color={PC_BLUE} />
                        </Pressable>
                    </HStack>
                </HStack>

                <HStack bg="white" p="1" rounded="md" shadow={1}>
                    <Pressable
                        flex={1}
                        onPress={() => setViewType('list')}
                        bg={viewType === 'list' ? PC_BLUE : 'transparent'}
                        py="2" rounded="md"
                    >
                        <Center><Text color={viewType === 'list' ? 'white' : 'coolGray.500'} fontWeight="bold">LIST</Text></Center>
                    </Pressable>
                    <Pressable
                        flex={1}
                        onPress={() => setViewType('logs')}
                        bg={viewType === 'logs' ? PC_BLUE : 'transparent'}
                        py="2" rounded="md"
                    >
                        <Center><Text color={viewType === 'logs' ? 'white' : 'coolGray.500'} fontWeight="bold">TIMELINE</Text></Center>
                    </Pressable>
                </HStack>

                {loading ? (
                    <Center flex={1}><Spinner color={PC_BLUE} /></Center>
                ) : (
                    <FlatList
                        data={viewType === 'list' ? maps : logs}
                        renderItem={viewType === 'list' ? renderMapItem : renderLogItem}
                        keyExtractor={(item, index) => item.id || index.toString()}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <Center mt="20">
                                <Icon as={MaterialCommunityIcons} name="folder-open-outline" size="6xl" color="coolGray.100" />
                                <Text color="coolGray.400">No project maps found</Text>
                            </Center>
                        }
                    />
                )}
            </VStack>

            {/* Actionsheet for Item Ops */}
            <Actionsheet isOpen={isActionOpen} onClose={onActionClose}>
                <Actionsheet.Content>
                    <Box w="100%" h={60} px={4} justifyContent="center">
                        <Text fontSize="16" color="gray.500" fontWeight="bold">
                            {selectedMap?.mapCatalogName || selectedMap?.proName}
                        </Text>
                    </Box>
                    <Actionsheet.Item startIcon={<Icon as={MaterialCommunityIcons} name="pencil" size="5" />} onPress={openEditModal}>
                        Rename
                    </Actionsheet.Item>
                    <Actionsheet.Item
                        startIcon={<Icon as={MaterialCommunityIcons} name="rocket-launch" size="5" color="indigo.500" />}
                        onPress={() => {
                            onActionClose();
                            navigation.navigate('MapDetail', { mapId: selectedMap.id, mapName: selectedMap.mapCatalogName });
                        }}
                    >
                        Open Editor
                    </Actionsheet.Item>
                    <Actionsheet.Item
                        startIcon={<Icon as={MaterialCommunityIcons} name="delete" size="5" color="red.500" />}
                        _text={{ color: "red.500" }}
                        onPress={handleDelete}
                    >
                        Delete
                    </Actionsheet.Item>
                </Actionsheet.Content>
            </Actionsheet>

            {/* Modal for Create/Edit */}
            <Modal isOpen={isModalOpen} onClose={onModalClose}>
                <Modal.Content>
                    <Modal.Header>{modalMode === 'create' ? 'New Project Map' : 'Rename Map'}</Modal.Header>
                    <Modal.Body>
                        <FormControl>
                            <FormControl.Label>Name</FormControl.Label>
                            <Input
                                value={mapName}
                                onChangeText={setMapName}
                                placeholder="Enter map name..."
                                autoFocus
                            />
                        </FormControl>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button.Group space={2}>
                            <Button variant="ghost" colorScheme="blueGray" onPress={onModalClose}>Cancel</Button>
                            <Button
                                bg={PC_BLUE}
                                onPress={modalMode === 'create' ? handleCreate : handleRename}
                            >
                                {modalMode === 'create' ? 'Create' : 'Save'}
                            </Button>
                        </Button.Group>
                    </Modal.Footer>
                </Modal.Content>
            </Modal>
        </Box>
    );
};

export default ProjectMapScreen;
