
import React, { useEffect, useState } from 'react';
import { Box, FlatList, Heading, Text, VStack, Spinner, Center, Pressable } from 'native-base';
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

    if (loading) {
        return <Center flex={1}><Spinner size="lg" /></Center>;
    }

    return (
        <Box flex={1} bg="white" safeAreaTop>
            <Heading p="4" size="md">My Projects</Heading>
            <FlatList
                data={projects}
                renderItem={({ item }) => (
                    <Pressable onPress={() => navigation.navigate('TaskList', { projectId: item.id, projectName: item.name })}>
                        {({ isPressed }) => (
                            <Box
                                borderBottomWidth="1"
                                borderColor="coolGray.200"
                                pl="4" pr="5" py="4"
                                bg={isPressed ? "coolGray.100" : "white"}
                            >
                                <VStack space={1}>
                                    <Text color="coolGray.800" bold fontSize="md">{item.name}</Text>
                                    <Text color="coolGray.500" fontSize="xs">
                                        {item.projectStateName || 'Ongoing'}
                                    </Text>
                                </VStack>
                            </Box>
                        )}
                    </Pressable>
                )}
                keyExtractor={item => item.id?.toString() || Math.random().toString()}
            />
        </Box>
    );
};

export default ProjectScreen;
