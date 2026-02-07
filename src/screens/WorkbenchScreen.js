
import React from 'react';
import {
    Box, Heading, Text, VStack, HStack,
    Icon, Pressable, SimpleGrid, ScrollView,
    Center, Divider
} from 'native-base';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const PC_BLUE = '#1890ff';

const WorkbenchScreen = () => {
    const navigation = useNavigation();

    const modules = [
        { id: 'Todo', label: 'Todo', icon: 'calendar-check', color: '#1890ff', screen: 'Index' },
        { id: 'Project', label: 'Projects', icon: 'folder-outline', color: '#722ed1', screen: 'Projects' },
        { id: 'Task', label: 'Tasks', icon: 'clipboard-list-outline', color: '#2f54eb', screen: 'Tasks' },
        { id: 'Map', label: 'MindMap', icon: 'sitemap-outline', color: '#13c2c2', screen: 'Maps' },
        { id: 'Stats', label: 'Stats', icon: 'chart-box-outline', color: '#fa8c16', screen: 'Stats' },
        { id: 'Partner', label: 'Partner', icon: 'account-group-outline', color: '#eb2f96', screen: 'Partner' },
        { id: 'Worktime', label: 'Worktime', icon: 'clock-outline', color: '#52c41a', screen: 'Worktime' },
        { id: 'File', label: 'Files', icon: 'file-document-outline', color: '#faad14', screen: 'Files' },
        { id: 'Report', label: 'Reports', icon: 'file-chart-outline', color: '#f5222d', screen: 'Reports' },
    ];

    const renderModule = (item) => (
        <Pressable
            key={item.id}
            onPress={() => {
                if (item.screen) {
                    navigation.navigate(item.screen);
                }
            }}
            w="33%"
            mb="6"
        >
            <VStack alignItems="center" space={2}>
                <Box
                    p="3"
                    bg="white"
                    rounded="xl"
                    shadow={2}
                    borderWidth={1}
                    borderColor="coolGray.100"
                >
                    <Icon
                        as={MaterialCommunityIcons}
                        name={item.icon}
                        size="md"
                        color={item.color}
                    />
                </Box>
                <Text fontSize="xs" fontWeight="500" color="coolGray.700">{item.label}</Text>
            </VStack>
        </Pressable>
    );

    return (
        <Box flex={1} bg="coolGray.50" safeAreaTop>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <Box bg="white" px="5" py="6" borderBottomWidth={1} borderBottomColor="coolGray.100">
                    <HStack justifyContent="space-between" alignItems="center">
                        <VStack>
                            <Heading size="md" color="coolGray.800">Workbench</Heading>
                            <Text fontSize="xs" color="coolGray.400">Aim.Link Workspace • PC 4.0</Text>
                        </VStack>
                        <Pressable p="2">
                            <Icon as={MaterialCommunityIcons} name="bell-outline" size="sm" color="coolGray.600" />
                        </Pressable>
                    </HStack>
                </Box>

                {/* Core Modules Grid */}
                <Box p="5" mt="2">
                    <Heading size="xs" color="coolGray.500" mb="5" textTransform="uppercase" letterSpacing="1">
                        Business Modules
                    </Heading>
                    <HStack flexWrap="wrap">
                        {modules.map(renderModule)}
                    </HStack>
                </Box>

                {/* Shortcuts / Recent */}
                <Box px="5" pb="10">
                    <Heading size="xs" color="coolGray.500" mb="4" textTransform="uppercase" letterSpacing="1">
                        Recent Activity
                    </Heading>
                    <VStack space={3}>
                        {[1, 2].map(i => (
                            <Box key={i} bg="white" p="4" rounded="lg" shadow={1} borderWidth={1} borderColor="coolGray.100">
                                <HStack space={3} alignItems="center">
                                    <Box p="2" bg="blue.50" rounded="full">
                                        <Icon as={MaterialCommunityIcons} name="update" size="xs" color={PC_BLUE} />
                                    </Box>
                                    <VStack flex={1}>
                                        <Text fontSize="sm" fontWeight="bold">Project Updated</Text>
                                        <Text fontSize="xs" color="coolGray.400">Website Redesign 2026 was modified by James</Text>
                                    </VStack>
                                    <Text fontSize="10px" color="coolGray.300">2h ago</Text>
                                </HStack>
                            </Box>
                        ))}
                    </VStack>
                </Box>
            </ScrollView>
        </Box>
    );
};

export default WorkbenchScreen;
