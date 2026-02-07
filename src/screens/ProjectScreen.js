
import React, { useEffect, useState } from 'react';
import { Box, FlatList, Heading, Text, VStack, Spinner, Center, Pressable, HStack, Badge, Progress, Avatar } from 'native-base';
import { getProjectList } from '../api/project';
import { useNavigation } from '@react-navigation/native';

const ProjectScreen = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const res = await getProjectList({ pageNo: 1, pageSize: 20 });
            // API returns standard paging object { list: [...] }
            setProjects(res?.list || res || []);
        } catch (error) {
            console.error('Fetch projects failed', error);
        } finally {
            setLoading(false);
        }
    };

    const renderProjectItem = ({ item }) => {
        // Calculate progress or random if missing (for demo)
        const progress = item.progress || Math.floor(Math.random() * 100);
        const statusColor = item.projectStateName === 'Completed' ? 'emerald' : 'indigo';

        return (
            <Pressable onPress={() => navigation.navigate('TaskList', { projectId: item.id, projectName: item.name })}>
                {({ isPressed }) => (
                    <Box
                        bg={isPressed ? "coolGray.50" : "white"}
                        p="5"
                        mb="4"
                        rounded="xl"
                        shadow={2}
                        borderWidth="1"
                        borderColor="coolGray.100"
                    >
                        <HStack justifyContent="space-between" alignItems="flex-start" mb="3">
                            <VStack space={1} flex={1}>
                                <Heading size="md" color="coolGray.800" isTruncated>
                                    {item.name}
                                </Heading>
                                <Text fontSize="xs" color="coolGray.400">
                                    Code: {item.projectCode || 'N/A'}
                                </Text>
                            </VStack>
                            <Badge colorScheme={statusColor} rounded="md" variant="subtle" _text={{ fontSize: "2xs", fontWeight: "bold" }}>
                                {item.projectStateName || 'ONGOING'}
                            </Badge>
                        </HStack>

                        <Text fontSize="sm" color="coolGray.500" numberOfLines={2} mb="4">
                            {item.description || "No description provided for this project. Manage your tasks effectively."}
                        </Text>

                        <VStack space={2}>
                            <HStack justifyContent="space-between" alignItems="center">
                                <Text fontSize="xs" color="coolGray.400" fontWeight="medium">Progress</Text>
                                <Text fontSize="xs" color={`${statusColor}.500`} fontWeight="bold">{progress}%</Text>
                            </HStack>
                            <Progress
                                value={progress}
                                colorScheme={statusColor}
                                size="xs"
                                bg="coolGray.100"
                                rounded="full"
                            />
                        </VStack>

                        <HStack justifyContent="space-between" alignItems="center" mt="4">
                            <Avatar.Group _avatar={{ size: "sm" }} max={3}>
                                <Avatar bg="indigo.500" source={{ uri: "https://bit.ly/broken-link" }}>
                                    {item.managerName?.substring(0, 2).toUpperCase() || "PM"}
                                </Avatar>
                                <Avatar bg="cyan.500">
                                    JP
                                </Avatar>
                                <Avatar bg="emerald.500">
                                    WK
                                </Avatar>
                            </Avatar.Group>
                            <Text fontSize="2xs" color="coolGray.400">
                                Updated {item.updateTime ? new Date(item.updateTime).toLocaleDateString() : 'Today'}
                            </Text>
                        </HStack>
                    </Box>
                )}
            </Pressable>
        );
    };

    if (loading) {
        return <Center flex={1} bg="coolGray.50"><Spinner size="lg" color="indigo.500" /></Center>;
    }

    return (
        <Box flex={1} bg="coolGray.50" safeAreaTop>
            <Box px="5" py="4" pb="2">
                <Heading size="lg" color="coolGray.800">Projects</Heading>
                <Text color="coolGray.500" fontSize="sm">Manage your ongoing work</Text>
            </Box>
            <FlatList
                data={projects}
                renderItem={renderProjectItem}
                keyExtractor={item => item.id?.toString() || Math.random().toString()}
                contentContainerStyle={{ padding: 20, paddingTop: 10 }}
                showsVerticalScrollIndicator={false}
            />
        </Box>
    );
};

export default ProjectScreen;
