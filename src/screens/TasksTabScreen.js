
import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Text, VStack, HStack, FlatList,
    Heading, Icon, Spinner, Center, Pressable, Badge, ScrollView,
    Input, Modal, FormControl, Button, useToast, useDisclose
} from 'native-base';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getMyTodo, createTask } from '../api/task_v2';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

const PC_BLUE = '#1890ff';

const TasksTabScreen = () => {
    const navigation = useNavigation();
    const toast = useToast();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('0'); // 0: myTodo, dwc: to complete, dqr: to confirm
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchVisible, setIsSearchVisible] = useState(false);

    // Quick Add Task
    const { isOpen, onOpen, onClose } = useDisclose();
    const [newTaskName, setNewTaskName] = useState('');

    const tabs = [
        { key: '0', label: 'My Todo' },
        { key: 'dwc', label: 'Pending' },
        { key: 'dqr', label: 'Confirm' },
        { key: 'dzp', label: 'Assigned' },
        { key: 'sp', label: 'Approval' },
        { key: 'hb', label: 'Report' },
    ];

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const res = await getMyTodo({
                pageNo: 1,
                pageSize: 100,
                data: {
                    type: activeTab,
                    showType: '1',
                    searchValue: searchQuery
                }
            });
            setTasks(res.list || []);
        } catch (error) {
            console.error('FetchTasks error:', error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchTasks();
        }, [activeTab])
    );

    const handleQuickAdd = async () => {
        if (!newTaskName) return;
        try {
            await createTask({
                taskname: newTaskName,
                priority: '1'
            });
            toast.show({ description: "Personal task added" });
            setNewTaskName('');
            onClose();
            fetchTasks();
        } catch (e) {
            toast.show({ description: "Failed to add", status: "error" });
        }
    };

    const renderTaskItem = ({ item }) => {
        const isCompleted = item.state === '2' || item.stateName === 'Done';
        const priorityColor = item.priority === '3' ? 'red.500' : (item.priority === '2' ? 'orange.500' : PC_BLUE);

        return (
            <Pressable
                onPress={() => navigation.navigate('TaskDetail', {
                    taskId: item.id || item.taskId,
                    taskName: item.taskname || item.name
                })}
            >
                <Box
                    bg="white"
                    p="4"
                    mb="3"
                    rounded="lg"
                    borderLeftWidth={4}
                    borderLeftColor={isCompleted ? 'emerald.400' : priorityColor}
                    shadow={1}
                >
                    <VStack space={2}>
                        <HStack justifyContent="space-between" alignItems="flex-start">
                            <Text
                                fontSize="sm"
                                fontWeight="bold"
                                color={isCompleted ? "coolGray.400" : "coolGray.800"}
                                textDecorationLine={isCompleted ? 'line-through' : 'none'}
                                flex={1}
                            >
                                {item.taskname || item.name}
                            </Text>
                            <Badge colorScheme={isCompleted ? 'green' : 'blue'} variant="subtle" rounded="sm" _text={{ fontSize: '10px' }}>
                                {item.stateName || (isCompleted ? 'Done' : 'Ongoing')}
                            </Badge>
                        </HStack>
                        <HStack justifyContent="space-between" alignItems="center">
                            <HStack space={4}>
                                <HStack space={1} alignItems="center">
                                    <Icon as={MaterialCommunityIcons} name="calendar-clock" size="xs" color="coolGray.400" />
                                    <Text fontSize="10px" color="coolGray.500">
                                        {item.planEndTime?.split(' ')[0] || (item.endTime ? item.endTime.split(' ')[0] : (item.endDate ? item.endDate.split(' ')[0] : 'No Date'))}
                                    </Text>
                                </HStack>
                            </HStack>
                            <Text fontSize="10px" color={PC_BLUE} fontWeight="500" isTruncated maxW="150">{item.projectName || item.proname}</Text>
                        </HStack>
                    </VStack>
                </Box>
            </Pressable>
        );
    };

    return (
        <Box flex={1} bg="coolGray.50" safeAreaTop>
            <VStack flex={1}>
                {/* Header */}
                <Box bg="white" px="5" py="4" borderBottomWidth={1} borderBottomColor="coolGray.100">
                    <HStack justifyContent="space-between" alignItems="center">
                        {isSearchVisible ? (
                            <HStack flex={1} space={2} alignItems="center">
                                <Input
                                    flex={1}
                                    placeholder="Search tasks..."
                                    variant="filled"
                                    bg="coolGray.100"
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                    onSubmitEditing={fetchTasks}
                                    autoFocus
                                />
                                <Pressable onPress={() => { setIsSearchVisible(false); setSearchQuery(''); fetchTasks(); }}>
                                    <Text color={PC_BLUE}>Cancel</Text>
                                </Pressable>
                            </HStack>
                        ) : (
                            <>
                                <Heading size="md">Personal Todo</Heading>
                                <HStack space={4}>
                                    <Pressable onPress={() => setIsSearchVisible(true)}>
                                        <Icon as={MaterialCommunityIcons} name="magnify" size="sm" color="coolGray.600" />
                                    </Pressable>
                                    <Pressable onPress={onOpen}>
                                        <Icon as={MaterialCommunityIcons} name="plus" size="sm" color={PC_BLUE} />
                                    </Pressable>
                                </HStack>
                            </>
                        )}
                    </HStack>
                </Box>

                {/* Categories */}
                <Box bg="white" borderBottomWidth={1} borderBottomColor="coolGray.100">
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} px="3" py="2">
                        <HStack space={2}>
                            {tabs.map(tab => (
                                <Pressable
                                    key={tab.key}
                                    onPress={() => setActiveTab(tab.key)}
                                    px="4"
                                    py="1.5"
                                    bg={activeTab === tab.key ? PC_BLUE : "transparent"}
                                    rounded="full"
                                    borderWidth={1}
                                    borderColor={activeTab === tab.key ? PC_BLUE : "coolGray.200"}
                                >
                                    <Text
                                        fontSize="xs"
                                        fontWeight="600"
                                        color={activeTab === tab.key ? "white" : "coolGray.500"}
                                    >
                                        {tab.label}
                                    </Text>
                                </Pressable>
                            ))}
                        </HStack>
                    </ScrollView>
                </Box>

                {loading ? (
                    <Center flex={1}>
                        <Spinner color={PC_BLUE} />
                    </Center>
                ) : (
                    <FlatList
                        data={tasks}
                        px="4"
                        py="4"
                        renderItem={renderTaskItem}
                        keyExtractor={(item, index) => (item.id || item.taskId || index).toString()}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <Center mt="20">
                                <Icon as={MaterialCommunityIcons} name="checkbox-marked-circle-outline" size="6xl" color="coolGray.100" />
                                <Text color="coolGray.400" mt="2">No tasks found</Text>
                            </Center>
                        }
                    />
                )}
            </VStack>

            <Modal isOpen={isOpen} onClose={onClose}>
                <Modal.Content>
                    <Modal.Header>Quick Add Personal Task</Modal.Header>
                    <Modal.Body>
                        <FormControl>
                            <FormControl.Label>Task Name</FormControl.Label>
                            <Input value={newTaskName} onChangeText={setNewTaskName} placeholder="What's on your mind?" autoFocus />
                        </FormControl>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button.Group space={2}>
                            <Button variant="ghost" colorScheme="blueGray" onPress={onClose}>Cancel</Button>
                            <Button bg={PC_BLUE} onPress={handleQuickAdd}>Add</Button>
                        </Button.Group>
                    </Modal.Footer>
                </Modal.Content>
            </Modal>
        </Box>
    );
};

export default TasksTabScreen;
