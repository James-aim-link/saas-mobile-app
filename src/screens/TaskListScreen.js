
import React, { useEffect, useState } from 'react';
import { Box, FlatList, Heading, Text, VStack, Spinner, Center, HStack } from 'native-base';
import { getTaskList } from '../api/task'; // Create this API if not exists
import { useRoute } from '@react-navigation/native';

const TaskListScreen = () => {
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
                renderItem={({ item }) => (
                    <Box borderBottomWidth="1" borderColor="coolGray.100" pl="4" pr="5" py="3">
                        <VStack space={1}>
                            <Text color="coolGray.800" bold fontSize="sm">{item.taskname}</Text>
                            <HStack space={2}>
                                <Text fontSize="xs" color={item.state === '2' ? 'green.600' : 'orange.500'}>
                                    {item.stateName || (item.state === '2' ? 'Completed' : 'Pending')}
                                </Text>
                                <Text fontSize="xs" color="gray.400">
                                    {item.executorName || 'Unassigned'}
                                </Text>
                            </HStack>
                        </VStack>
                    </Box>
                )}
                keyExtractor={item => item.id?.toString()}
                ListEmptyComponent={
                    <Center mt="10">
                        <Text color="gray.400">No tasks found</Text>
                    </Center>
                }
            />
        </Box>
    );
};

export default TaskListScreen;
