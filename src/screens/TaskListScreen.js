
import React, { useEffect, useState } from 'react';
import { Box, FlatList, Heading, Text, VStack, Spinner, Center, HStack, Pressable, Avatar, Badge, Icon } from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import { getTaskList } from '../api/task';
import { useRoute, useNavigation } from '@react-navigation/native';

const TaskListScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { projectId, projectName } = route.params;
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (projectId) {
            fetchTasks();
        }
    }, [projectId]);

    const fetchTasks = async () => {
        try {
            // Using endpoint from pc4.0 analysis: taskinfo/list/search
            const res = await getTaskList({
                pageNo: 1,
                pageSize: 20,
                projectId: projectId
            });
            setTasks(res?.list || []);
        } catch (error) {
            console.error('Fetch tasks failed', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <Center flex={1}><Spinner size="lg" /></Center>;
    }

    return (
        <Box flex={1} bg="white" safeAreaTop>
            <Box p="4" borderBottomWidth="1" borderColor="coolGray.200">
                <Heading size="sm" isTruncated>{projectName}</Heading>
                <Text fontSize="xs" color="gray.500">Task List</Text>
            </Box>

            <FlatList
                data={tasks}
                contentContainerStyle={{ padding: 16 }}
                renderItem={({ item }) => {
                    const isCompleted = item.state === '2';
                    const priorityColor = item.priority === '3' ? 'red.500' : (item.priority === '2' ? 'orange.500' : 'blue.500');

                    return (
                        <Pressable onPress={() => navigation.navigate('TaskDetail', { taskId: item.id, taskName: item.taskname })}>
                            {({ isPressed }) => (
                                <Box
                                    bg={isPressed ? "coolGray.50" : "white"}
                                    p="4"
                                    mb="3"
                                    rounded="lg"
                                    shadow={1}
                                    borderLeftWidth="4"
                                    borderLeftColor={isCompleted ? "green.500" : priorityColor}
                                >
                                    <HStack justifyContent="space-between" alignItems="flex-start">
                                        <VStack space={1} flex={1} mr="2">
                                            <HStack alignItems="center" space={2}>
                                                <Text
                                                    color={isCompleted ? "gray.400" : "coolGray.800"}
                                                    textDecorationLine={isCompleted ? 'line-through' : 'none'}
                                                    bold
                                                    fontSize="md"
                                                >
                                                    {item.taskname}
                                                </Text>
                                                {item.priority === '3' && <Badge colorScheme="red" variant="solid" size="sm" rounded="sm">HIGH</Badge>}
                                            </HStack>

                                            <HStack space={3} alignItems="center" mt="1">
                                                <HStack space={1} alignItems="center">
                                                    <Icon as={Ionicons} name="calendar-outline" size="xs" color="gray.400" />
                                                    <Text fontSize="xs" color="gray.500">
                                                        {item.endDate ? new Date(item.endDate).toLocaleDateString() : 'No Due Date'}
                                                    </Text>
                                                </HStack>

                                                <HStack space={1} alignItems="center">
                                                    <Icon as={Ionicons} name="flag-outline" size="xs" color="gray.400" />
                                                    <Text fontSize="xs" color="gray.500">
                                                        {item.stateName || (isCompleted ? "Done" : "To Do")}
                                                    </Text>
                                                </HStack>
                                            </HStack>
                                        </VStack>

                                        <Avatar bg="indigo.500" size="sm" source={{ uri: item.executorAvatar }}>
                                            {item.executorName ? item.executorName.substring(0, 2).toUpperCase() : "UN"}
                                        </Avatar>
                                    </HStack>
                                </Box>
                            )}
                        </Pressable>
                    );
                }}
                keyExtractor={item => item.id?.toString()}
                ListEmptyComponent={
                    <Center mt="20">
                        <Icon as={Ionicons} name="clipboard-outline" size="6xl" color="gray.200" mb="4" />
                        <Text color="gray.400" fontSize="lg">No tasks found</Text>
                        <Text color="gray.300" fontSize="sm">Great job staying on top of things!</Text>
                    </Center>
                }
            />
        </Box>
    );
};

export default TaskListScreen;
