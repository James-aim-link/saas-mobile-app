
import React, { useEffect, useState } from 'react';
import {
    Box, Heading, Text, VStack, Spinner, Center,
    ScrollView, HStack, Badge, Icon, Button,
    Divider, Avatar, Actionsheet, useDisclose,
    Modal, FormControl, Input, useToast, Pressable
} from 'native-base';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { getTaskDetail, updateTask, deleteTask, getTaskLogList } from '../api/task_v2';

const PC_BLUE = '#1890ff';

const TaskDetailScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const toast = useToast();
    const { taskId, taskName: initialTaskName } = route.params;

    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('detail');
    const [logs, setLogs] = useState([]);
    const [logsLoading, setLogsLoading] = useState(false);
    const [editName, setEditName] = useState('');

    const { isOpen: isActionOpen, onOpen: onActionOpen, onClose: onActionClose } = useDisclose();
    const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclose();

    useEffect(() => {
        if (taskId) {
            fetchTaskDetail();
            fetchLogs();
        }
    }, [taskId]);

    const fetchTaskDetail = async () => {
        setLoading(true);
        try {
            const res = await getTaskDetail(taskId);
            setTask(res || {});
            setEditName(res?.taskname || res?.name || initialTaskName);
        } catch (error) {
            console.error('Fetch task detail failed', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchLogs = async () => {
        setLogsLoading(true);
        try {
            const res = await getTaskLogList({ pageNo: 1, pageSize: 20, taskId });
            setLogs(res.list || []);
        } catch (e) {
            console.error('Log fetch error:', e);
        } finally {
            setLogsLoading(false);
        }
    };

    const handleUpdateStatus = async (newState) => {
        try {
            await updateTask({ id: taskId, state: newState });
            toast.show({ description: newState === '2' ? "Task completed" : "Task reopened" });
            fetchTaskDetail();
            fetchLogs();
        } catch (e) {
            toast.show({ description: "Update failed", status: "error" });
        }
    };

    const handleRename = async () => {
        if (!editName) return;
        try {
            await updateTask({ id: taskId, taskname: editName });
            toast.show({ description: "Task renamed" });
            onEditClose();
            fetchTaskDetail();
            fetchLogs();
        } catch (e) {
            toast.show({ description: "Rename failed", status: "error" });
        }
    };

    const handleDelete = async () => {
        try {
            await deleteTask(taskId);
            toast.show({ description: "Task deleted" });
            onActionClose();
            navigation.goBack();
        } catch (e) {
            toast.show({ description: "Delete failed", status: "error" });
        }
    };

    if (loading) {
        return <Center flex={1} bg="white"><Spinner color={PC_BLUE} /></Center>;
    }

    const displayTask = task || { taskname: initialTaskName };
    const isCompleted = displayTask.state === '2' || displayTask.stateName === 'Done';

    const InfoRow = ({ icon, label, value, color = PC_BLUE }) => (
        <HStack space={4} alignItems="center" mb="4">
            <Box p="2" bg={`${color}10`} rounded="full">
                <Icon as={MaterialCommunityIcons} name={icon} size="xs" color={color} />
            </Box>
            <VStack flex={1}>
                <Text fontSize="10px" color="coolGray.400" fontWeight="600" textTransform="uppercase">{label}</Text>
                <Text fontSize="sm" color="coolGray.800" fontWeight="500">{value || 'Not Set'}</Text>
            </VStack>
        </HStack>
    );

    return (
        <Box flex={1} bg="white" safeAreaTop>
            <Box px="4" py="3" borderBottomWidth={1} borderBottomColor="coolGray.100">
                <HStack justifyContent="space-between" alignItems="center">
                    <HStack space={3} alignItems="center">
                        <Pressable onPress={() => navigation.goBack()}>
                            <Icon as={MaterialCommunityIcons} name="chevron-left" size="sm" color="coolGray.800" />
                        </Pressable>
                        <Text fontSize="xs" color="coolGray.400" fontWeight="500">Task Details</Text>
                    </HStack>
                    <Pressable onPress={onActionOpen}>
                        <Icon as={MaterialCommunityIcons} name="dots-horizontal" size="sm" color="coolGray.600" />
                    </Pressable>
                </HStack>
            </Box>

            <HStack bg="white" borderBottomWidth={1} borderBottomColor="coolGray.100">
                <Pressable flex={1} onPress={() => setActiveTab('detail')} borderBottomWidth={2} borderBottomColor={activeTab === 'detail' ? PC_BLUE : 'transparent'} py="3">
                    <Center><Text fontWeight="bold" color={activeTab === 'detail' ? PC_BLUE : "coolGray.400"}>DETAILS</Text></Center>
                </Pressable>
                <Pressable flex={1} onPress={() => setActiveTab('timeline')} borderBottomWidth={2} borderBottomColor={activeTab === 'timeline' ? PC_BLUE : 'transparent'} py="3">
                    <Center><Text fontWeight="bold" color={activeTab === 'timeline' ? PC_BLUE : "coolGray.400"}>TIMELINE</Text></Center>
                </Pressable>
            </HStack>

            <ScrollView showsVerticalScrollIndicator={false}>
                {activeTab === 'detail' ? (
                    <VStack p="5" space={6}>
                        <VStack space={2}>
                            <HStack justifyContent="space-between" alignItems="flex-start">
                                <Heading size="md" color="coolGray.800" flex={1} mr="4">{displayTask.taskname || displayTask.name}</Heading>
                                <Badge colorScheme={isCompleted ? "emerald" : "blue"} variant="subtle" rounded="sm" _text={{ fontSize: '10px', fontWeight: 'bold' }}>
                                    {displayTask.stateName || (isCompleted ? "DONE" : "TODO")}
                                </Badge>
                            </HStack>
                            <Text fontSize="xs" color="coolGray.400">#{displayTask.id} • {displayTask.projectName || 'Project'}</Text>
                        </VStack>

                        <Divider />

                        <VStack space={1}>
                            <InfoRow icon="account-outline" label="Assignee" value={displayTask.executorName} color="#722ed1" />
                            <InfoRow icon="calendar-range" label="Due Date" value={displayTask.endDate ? displayTask.endDate.split(' ')[0] : 'No Deadline'} color="#fa8c16" />
                            <InfoRow icon="flag-outline" label="Priority" value={displayTask.priorityName || 'Normal'} color={displayTask.priority === '3' ? '#f5222d' : '#1890ff'} />
                        </VStack>

                        <Divider />

                        <VStack space={2}>
                            <Heading size="xs" color="coolGray.500" textTransform="uppercase">Description</Heading>
                            <Box bg="coolGray.50" p="4" rounded="lg">
                                <Text color="coolGray.700" fontSize="sm" lineHeight="lg">{displayTask.description || "No description provided."}</Text>
                            </Box>
                        </VStack>
                    </VStack>
                ) : (
                    <VStack p="5" space={4}>
                        {logsLoading ? (
                            <Center py="10"><Spinner color={PC_BLUE} /></Center>
                        ) : logs.length > 0 ? (
                            logs.map((log, idx) => (
                                <HStack key={idx} space={3} mb="4">
                                    <VStack alignItems="center">
                                        <Box w="2" h="2" rounded="full" bg={PC_BLUE} mt="2" />
                                        <Box flex={1} w="0.5" bg="coolGray.200" />
                                    </VStack>
                                    <VStack flex={1} space={1}>
                                        <HStack justifyContent="space-between">
                                            <Text fontSize="xs" fontWeight="bold" color="coolGray.700">{log.operatorName}</Text>
                                            <Text fontSize="10px" color="coolGray.400">{log.createTime}</Text>
                                        </HStack>
                                        <Text fontSize="xs" color="coolGray.600">{log.content}</Text>
                                    </VStack>
                                </HStack>
                            ))
                        ) : (
                            <Center py="10">
                                <Icon as={MaterialCommunityIcons} name="history" size="4xl" color="coolGray.100" />
                                <Text color="coolGray.400" mt="2">No activity logs yet</Text>
                            </Center>
                        )}
                    </VStack>
                )}
            </ScrollView>

            <Box p="4" borderTopWidth={1} borderTopColor="coolGray.100" bg="white">
                <Button
                    size="lg" bg={isCompleted ? "coolGray.100" : PC_BLUE}
                    _text={{ color: isCompleted ? "coolGray.500" : "white", fontWeight: 'bold' }}
                    onPress={() => handleUpdateStatus(isCompleted ? '1' : '2')}
                >
                    {isCompleted ? "Reopen Task" : "Complete Task"}
                </Button>
            </Box>

            <Actionsheet isOpen={isActionOpen} onClose={onActionClose}>
                <Actionsheet.Content>
                    <Actionsheet.Item startIcon={<Icon as={MaterialCommunityIcons} name="pencil" size="5" />} onPress={() => { onActionClose(); onEditOpen(); }}>
                        Edit Task Name
                    </Actionsheet.Item>
                    <Actionsheet.Item startIcon={<Icon as={MaterialCommunityIcons} name="delete" size="5" color="red.500" />} _text={{ color: "red.500" }} onPress={handleDelete}>
                        Delete Task
                    </Actionsheet.Item>
                </Actionsheet.Content>
            </Actionsheet>

            <Modal isOpen={isEditOpen} onClose={onEditClose}>
                <Modal.Content>
                    <Modal.Header>Edit Task Name</Modal.Header>
                    <Modal.Body>
                        <FormControl>
                            <Input value={editName} onChangeText={setEditName} autoFocus />
                        </FormControl>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button.Group space={2}>
                            <Button variant="ghost" onPress={onEditClose}>Cancel</Button>
                            <Button bg={PC_BLUE} onPress={handleRename}>Save</Button>
                        </Button.Group>
                    </Modal.Footer>
                </Modal.Content>
            </Modal>
        </Box>
    );
};

export default TaskDetailScreen;
