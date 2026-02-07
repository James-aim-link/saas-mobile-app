
import React, { useEffect, useState, useCallback } from 'react';
import {
    Box, FlatList, Heading, Text, VStack, Spinner, Center,
    HStack, Pressable, Avatar, Badge, Icon, ScrollView,
    Modal, FormControl, Input, Button, useToast, useDisclose
} from 'native-base';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getTaskList, createTask } from '../api/task_v2';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';

const PC_BLUE = '#1890ff';

const TaskListScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclose();

    const { projectId, projectName } = route.params;
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeStatus, setActiveStatus] = useState('0'); // 0: total, 1: todo, 2: done
    const [newTaskName, setNewTaskName] = useState('');

    const statusTabs = [
        { key: '0', label: 'All' },
        { key: '1', label: 'To Do' },
        { key: '2', label: 'Done' }
    ];

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const res = await getTaskList({
                pageNo: 1,
                pageSize: 50,
                projectId: projectId,
                state: activeStatus === '0' ? '' : activeStatus
            });
            setTasks(res?.list || []);
        } catch (error) {
            console.error('Fetch tasks failed', error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            if (projectId) fetchTasks();
        }, [projectId, activeStatus])
    );

    const handleCreateTask = async () => {
        if (!newTaskName) return;
        try {
            await createTask({
                taskname: newTaskName,
                projectId: projectId,
                priority: '1'
            });
            toast.show({ description: "Task created" });
            setNewTaskName('');
            onClose();
            fetchTasks();
        } catch (e) {
            toast.show({ description: "Create failed", status: "error" });
        }
    };

    const renderTaskItem = ({ item }) => {
        const isCompleted = item.state === '2' || item.stateName === 'Done';
        const priorityColor = item.priority === '3' ? 'red.500' : (item.priority === '2' ? 'orange.500' : PC_BLUE);

        return (
            <Pressable onPress={() => navigation.navigate('TaskDetail', { taskId: item.id, taskName: item.taskname })}>
                <Box bg="white" p="4" mb="3" rounded="lg" shadow={1} borderLeftWidth="4" borderLeftColor={isCompleted ? "emerald.400" : priorityColor}>
                    <HStack justifyContent="space-between" alignItems="flex-start">
                        <VStack space={1} flex={1} mr="2">
                            <Text color={isCompleted ? "coolGray.400" : "coolGray.800"} textDecorationLine={isCompleted ? 'line-through' : 'none'} bold fontSize="sm">
                                {item.taskname}
                            </Text>
                            <HStack space={3} alignItems="center" mt="1">
                                <HStack space={1} alignItems="center">
                                    <Icon as={MaterialCommunityIcons} name="calendar-clock" size="xs" color="coolGray.400" />
                                    <Text fontSize="10px" color="coolGray.400">{item.endDate ? item.endDate.split(' ')[0] : 'No Date'}</Text>
                                </HStack>
                                <Badge colorScheme={isCompleted ? "emerald" : "blue"} variant="subtle" size="sm" rounded="sm" _text={{ fontSize: '10px' }}>
                                    {item.stateName || (isCompleted ? "Done" : "To Do")}
                                </Badge>
                            </HStack>
                        </VStack>
                        <Avatar bg="blue.500" size="xs">{item.executorName?.charAt(0) || "U"}</Avatar>
                    </HStack>
                </Box>
            </Pressable>
        );
    };

    return (
        <Box flex={1} bg="coolGray.50" safeAreaTop>
            <Box bg="white" px="5" py="4" borderBottomWidth={1} borderBottomColor="coolGray.100">
                <HStack space={3} alignItems="center">
                    <Pressable onPress={() => navigation.goBack()}>
                        <Icon as={MaterialCommunityIcons} name="arrow-left" size="sm" color="coolGray.800" />
                    </Pressable>
                    <VStack flex={1}>
                        <Heading size="sm" isTruncated>{projectName}</Heading>
                        <Text fontSize="10px" color="coolGray.400">Project Tasks</Text>
                    </VStack>
                    <HStack space={2}>
                        <Pressable onPress={fetchTasks}>
                            <Icon as={MaterialCommunityIcons} name="refresh" size="sm" color={PC_BLUE} />
                        </Pressable>
                        <Pressable onPress={onOpen}>
                            <Icon as={MaterialCommunityIcons} name="plus" size="sm" color={PC_BLUE} />
                        </Pressable>
                    </HStack>
                </HStack>
            </Box>

            <Box bg="white" px="5" py="2">
                <HStack space={4}>
                    {statusTabs.map(tab => (
                        <Pressable key={tab.key} onPress={() => setActiveStatus(tab.key)}>
                            <VStack alignItems="center" space={1}>
                                <Text fontSize="sm" fontWeight={activeStatus === tab.key ? "bold" : "normal"} color={activeStatus === tab.key ? PC_BLUE : "coolGray.500"}>
                                    {tab.label}
                                </Text>
                                {activeStatus === tab.key && <Box h="0.5" w="full" bg={PC_BLUE} rounded="full" />}
                            </VStack>
                        </Pressable>
                    ))}
                </HStack>
            </Box>

            {loading ? (
                <Center flex={1}><Spinner color={PC_BLUE} /></Center>
            ) : (
                <FlatList
                    data={tasks}
                    contentContainerStyle={{ padding: 16 }}
                    renderItem={renderTaskItem}
                    keyExtractor={item => item.id?.toString()}
                    ListEmptyComponent={
                        <Center mt="20">
                            <Icon as={MaterialCommunityIcons} name="clipboard-check-outline" size="6xl" color="coolGray.100" />
                            <Text color="coolGray.400">No tasks found</Text>
                        </Center>
                    }
                />
            )}

            <Modal isOpen={isOpen} onClose={onClose}>
                <Modal.Content>
                    <Modal.Header>Quick Add Task</Modal.Header>
                    <Modal.Body>
                        <FormControl>
                            <FormControl.Label>Task Name</FormControl.Label>
                            <Input value={newTaskName} onChangeText={setNewTaskName} placeholder="What needs to be done?" autoFocus />
                        </FormControl>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button.Group space={2}>
                            <Button variant="ghost" colorScheme="blueGray" onPress={onClose}>Cancel</Button>
                            <Button bg={PC_BLUE} onPress={handleCreateTask}>Add</Button>
                        </Button.Group>
                    </Modal.Footer>
                </Modal.Content>
            </Modal>
        </Box>
    );
};

export default TaskListScreen;
