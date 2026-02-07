import React, { useEffect, useState } from 'react';
import { Box, Heading, Text, VStack, Spinner, Center, ScrollView, HStack, Badge, Icon, Button, Divider } from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { getTaskDetail } from '../api/task';

const TaskDetailScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { taskId, taskName } = route.params; // taskName passed for immediate visual feedback
    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (taskId) {
            fetchTaskDetail();
        }
    }, [taskId]);

    const fetchTaskDetail = async () => {
        try {
            const res = await getTaskDetail(taskId);
            setTask(res || {});
        } catch (error) {
            console.error('Fetch task detail failed', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <Center flex={1} bg="white"><Spinner size="lg" color="indigo.500" /></Center>;
    }

    // Fallback if fetch fails but we have params
    const displayTask = task || { taskname: taskName };
    const isCompleted = displayTask.state === '2';

    return (
        <Box flex={1} bg="white" safeAreaTop>
            {/* Header */}
            <HStack p="4" alignItems="center" borderBottomWidth="1" borderColor="coolGray.100">
                <Button variant="ghost" p="2" onPress={() => navigation.goBack()}>
                    <Icon as={Ionicons} name="arrow-back" size="sm" color="coolGray.600" />
                </Button>
                <Heading size="sm" ml="2" flex={1} isTruncated>
                    Task Details
                </Heading>
                <Button variant="ghost" colorScheme="indigo">
                    Edit
                </Button>
            </HStack>

            <ScrollView contentContainerStyle={{ padding: 20 }}>
                {/* Title & Status */}
                <VStack space={3} mb="6">
                    <HStack justifyContent="space-between" alignItems="flex-start">
                        <Heading size="lg" color="coolGray.800" flex={1} mr="4">
                            {displayTask.taskname}
                        </Heading>
                        <Badge
                            colorScheme={isCompleted ? "green" : "orange"}
                            variant="subtle"
                            rounded="md"
                            _text={{ fontSize: "xs", fontWeight: "bold" }}
                        >
                            {displayTask.stateName || (isCompleted ? "DONE" : "TODO")}
                        </Badge>
                    </HStack>

                    {displayTask.priority && (
                        <HStack space={2} alignItems="center">
                            <Icon as={Ionicons} name="alert-circle-outline" size="xs" color="red.500" />
                            <Text color="red.500" fontWeight="medium">High Priority</Text>
                        </HStack>
                    )}
                </VStack>

                <Divider my="2" />

                {/* Meta Info Grid */}
                <VStack space={4} mt="4">
                    <HStack alignItems="center">
                        <Box p="2" bg="indigo.50" rounded="full" mr="4">
                            <Icon as={Ionicons} name="person-outline" size="sm" color="indigo.500" />
                        </Box>
                        <VStack>
                            <Text color="coolGray.400" fontSize="xs">Assignee</Text>
                            <Text color="coolGray.800" fontSize="md" fontWeight="medium">
                                {displayTask.executorName || "Unassigned"}
                            </Text>
                        </VStack>
                    </HStack>

                    <HStack alignItems="center">
                        <Box p="2" bg="orange.50" rounded="full" mr="4">
                            <Icon as={Ionicons} name="calendar-outline" size="sm" color="orange.500" />
                        </Box>
                        <VStack>
                            <Text color="coolGray.400" fontSize="xs">Due Date</Text>
                            <Text color="coolGray.800" fontSize="md" fontWeight="medium">
                                {displayTask.endDate ? new Date(displayTask.endDate).toDateString() : "No Due Date"}
                            </Text>
                        </VStack>
                    </HStack>

                    <HStack alignItems="center">
                        <Box p="2" bg="emerald.50" rounded="full" mr="4">
                            <Icon as={Ionicons} name="folder-outline" size="sm" color="emerald.500" />
                        </Box>
                        <VStack>
                            <Text color="coolGray.400" fontSize="xs">Project</Text>
                            <Text color="coolGray.800" fontSize="md" fontWeight="medium">
                                {displayTask.projectName || "Unknown Project"}
                            </Text>
                        </VStack>
                    </HStack>
                </VStack>

                <Divider my="6" />

                {/* Description */}
                <VStack space={2}>
                    <Heading size="sm" color="coolGray.700">Description</Heading>
                    <Text color="coolGray.600" fontSize="md" lineHeight="lg">
                        {displayTask.description || "No description provided for this task."}
                    </Text>
                </VStack>
            </ScrollView>

            <Box p="4" bg="white" borderTopWidth="1" borderColor="coolGray.100" safeAreaBottom>
                <Button
                    size="lg"
                    colorScheme={isCompleted ? "coolGray" : "indigo"}
                    onPress={() => console.log('Toggle complete')}
                    leftIcon={<Icon as={Ionicons} name="checkmark-circle-outline" size="sm" />}
                >
                    {isCompleted ? "Mark as Incomplete" : "Mark as Complete"}
                </Button>
            </Box>
        </Box>
    );
};

export default TaskDetailScreen;
