
import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Text, VStack, HStack, ScrollView,
    Heading, Icon, Spinner, Center, Pressable,
    Divider, FlatList, Avatar, Badge, Stack
} from 'native-base';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { storage } from '../utils/storage';
import { getTodoTaskCount, getMyTodo } from '../api/task_v2';
import { getRecentProjects } from '../api/statistics';

const PC_BLUE = '#1890ff';

const HomeScreen = () => {
    const navigation = useNavigation();
    const [user, setUser] = useState(null);
    const [todoCounts, setTodoCounts] = useState({
        sumCount: 0, dwcCount: 0, dqrCount: 0, dzpCount: 0
    });
    const [todoGroups, setTodoGroups] = useState([]);
    const [recentProjects, setRecentProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        try {
            const userData = await storage.getSession('user');
            setUser(userData);

            // Fetch Todo Counts (Categories)
            const countsRes = await getTodoTaskCount();
            if (countsRes) setTodoCounts(countsRes);

            // Fetch Groups (PC 4.0 style: Overdue, Today)
            const groupData = [];

            // 1. Overdue
            const overdue = await getMyTodo({ viewType: '1', pageSize: 5 });
            if (overdue?.list?.length > 0) {
                groupData.push({ title: 'Overdue', icon: 'alert-circle-outline', color: 'red.500', data: overdue.list });
            }

            // 2. Today
            const today = await getMyTodo({ viewType: '2', pageSize: 10 });
            groupData.push({ title: "Today's Todo", icon: 'calendar-today', color: PC_BLUE, data: today?.list || [] });

            // 3. Upcoming (Next 7 days)
            const upcoming = await getMyTodo({ viewType: '5', pageSize: 5 });
            if (upcoming?.list?.length > 0) {
                groupData.push({ title: 'Upcoming', icon: 'calendar-clock', color: 'orange.500', data: upcoming.list });
            }

            setTodoGroups(groupData);

            // Fetch recent projects
            const projectsRes = await getRecentProjects();
            setRecentProjects(projectsRes.list || []);

        } catch (error) {
            console.error('Home fetchData error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [])
    );

    const renderTodoItem = (item) => (
        <Pressable
            key={item.id}
            onPress={() => navigation.navigate('TaskDetail', { taskId: item.id })}
        >
            <Box
                bg="white"
                p="4"
                borderBottomWidth={1}
                borderBottomColor="coolGray.100"
            >
                <HStack space={3} alignItems="center">
                    <Icon
                        as={MaterialCommunityIcons}
                        name={item.state === '2' ? "checkbox-marked-circle" : "checkbox-blank-circle-outline"}
                        size="sm"
                        color={item.state === '2' ? "emerald.500" : "coolGray.300"}
                    />
                    <VStack flex={1}>
                        <Text fontSize="sm" fontWeight="500" color="coolGray.800" numberOfLines={1}>
                            {item.taskname || item.name || 'Untitled Task'}
                        </Text>
                        <HStack space={2} alignItems="center">
                            <Text fontSize="10px" color="coolGray.400">{item.projectName || item.proname}</Text>
                            {(item.planEndTime || item.plan_end_time || item.endDate) && (
                                <Text fontSize="10px" color="coolGray.400">• {(item.planEndTime || item.plan_end_time || item.endDate).split(' ')[0]}</Text>
                            )}
                        </HStack>
                    </VStack>
                </HStack>
            </Box>
        </Pressable>
    );

    const CategoryItem = ({ label, count, icon, color, active }) => (
        <Pressable flex={1} onPress={() => navigation.navigate('Tasks')}>
            <VStack
                alignItems="center"
                p="2"
                bg={active ? "blue.50" : "transparent"}
                rounded="lg"
            >
                <Center w="10" h="10" bg={active ? "blue.100" : "coolGray.100"} rounded="full" mb="1">
                    <Icon as={MaterialCommunityIcons} name={icon} size="sm" color={active ? PC_BLUE : "coolGray.500"} />
                </Center>
                <Heading size="xs" color={active ? PC_BLUE : "coolGray.800"}>{count}</Heading>
                <Text fontSize="10px" color="coolGray.500" textAlign="center">{label}</Text>
            </VStack>
        </Pressable>
    );

    if (loading && !refreshing) {
        return <Center flex={1} bg="white"><Spinner color={PC_BLUE} /></Center>;
    }

    return (
        <Box flex={1} bg="coolGray.50" safeAreaTop>
            <ScrollView
                showsVerticalScrollIndicator={false}
                onScrollEndDrag={() => {
                    setRefreshing(true);
                    fetchData();
                }}
            >
                {/* User Header */}
                <Box bg="white" px="5" py="4">
                    <HStack justifyContent="space-between" alignItems="center">
                        <VStack>
                            <Text fontSize="xs" color="coolGray.500" fontWeight="600">
                                {user?.corpName || 'Aim.Link'}
                            </Text>
                            <Heading size="md" color="coolGray.800">
                                {user?.name || 'Workspace'}
                            </Heading>
                        </VStack>
                        <Avatar size="sm" bg={PC_BLUE} source={{ uri: user?.avatar }}>
                            {user?.name?.charAt(0)}
                        </Avatar>
                    </HStack>
                </Box>

                {/* Todo Categories Summary */}
                <Box bg="white" mt="0.5" px="3" py="3" borderBottomWidth={1} borderBottomColor="coolGray.100">
                    <HStack justifyContent="space-around">
                        <CategoryItem label="My Todo" count={todoCounts.sumCount} icon="calendar-check" color={PC_BLUE} active />
                        <CategoryItem label="Pending" count={todoCounts.dwcCount} icon="clock-outline" />
                        <CategoryItem label="To Confirm" count={todoCounts.dqrCount} icon="account-check-outline" />
                        <CategoryItem label="Assigned" count={todoCounts.dzpCount} icon="account-arrow-right-outline" />
                    </HStack>
                </Box>

                {/* Main Workspace (Groups) */}
                <VStack p="4" space={4}>
                    {todoGroups.map((group, idx) => (
                        <Box key={idx} bg="white" rounded="lg" shadow={1} overflow="hidden">
                            <HStack p="3" bg="coolGray.50" alignItems="center" justifyContent="space-between">
                                <HStack space={2} alignItems="center">
                                    <Icon as={MaterialCommunityIcons} name={group.icon} size="xs" color={group.color} />
                                    <Heading size="xs" color="coolGray.700">{group.title}</Heading>
                                </HStack>
                                <Badge colorScheme={group.title === 'Overdue' ? 'red' : 'blue'} variant="subtle" rounded="full">
                                    {group.data.length}
                                </Badge>
                            </HStack>
                            <VStack>
                                {group.data.length > 0 ? (
                                    group.data.map(renderTodoItem)
                                ) : (
                                    <Center py="8">
                                        <Text fontSize="xs" color="coolGray.400">No tasks for today</Text>
                                    </Center>
                                )}
                            </VStack>
                            {group.data.length >= 5 && (
                                <Pressable onPress={() => navigation.navigate('Tasks')}>
                                    <Center py="2" borderTopWidth={1} borderTopColor="coolGray.50">
                                        <Text fontSize="xs" color={PC_BLUE}>View More</Text>
                                    </Center>
                                </Pressable>
                            )}
                        </Box>
                    ))}

                    {/* Recent Projects Section */}
                    <Box mt="2">
                        <HStack justifyContent="space-between" alignItems="center" mb="3">
                            <Heading size="sm">Recent Projects</Heading>
                            <Pressable onPress={() => navigation.navigate('Projects')}>
                                <Text fontSize="xs" color={PC_BLUE}>See All</Text>
                            </Pressable>
                        </HStack>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <HStack space={3}>
                                {recentProjects.map(item => (
                                    <Pressable
                                        key={item.id}
                                        onPress={() => navigation.navigate('TaskList', { projectId: item.id, projectName: item.proName || item.proname })}
                                    >
                                        <Box w="140" bg="white" p="3" rounded="lg" shadow={1} borderTopWidth={2} borderTopColor={PC_BLUE}>
                                            <Text fontSize="xs" fontWeight="bold" color="coolGray.800" numberOfLines={1}>{item.proName || item.proname}</Text>
                                            <Text fontSize="10px" color="coolGray.400" mt="1">{(item.percent || 0)}% Completed</Text>
                                        </Box>
                                    </Pressable>
                                ))}
                            </HStack>
                        </ScrollView>
                    </Box>
                </VStack>

                <Box py="8" alignItems="center">
                    <Text fontSize="10px" color="coolGray.300">Aim.Link Workspace • PC 4.0 Aligned</Text>
                </Box>
            </ScrollView>
        </Box>
    );
};

export default HomeScreen;
