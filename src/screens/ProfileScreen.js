
import React, { useEffect, useState } from 'react';
import {
    Box, Button, Center, Heading, VStack,
    Text, Avatar, HStack, Icon, Pressable,
    Divider, ScrollView
} from 'native-base';
import { storage } from '../utils/storage';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const PC_BLUE = '#1890ff';

const ProfileScreen = () => {
    const [user, setUser] = useState(null);
    const navigation = useNavigation();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const u = await storage.getSession('user');
        setUser(u);
    };

    const handleLogout = async () => {
        await storage.clear();
        navigation.replace('Login');
    };

    const MenuItem = ({ icon, label, onPress, color = "coolGray.800" }) => (
        <Pressable onPress={onPress}>
            <HStack px="5" py="4" justifyContent="space-between" alignItems="center" bg="white" borderBottomWidth={1} borderBottomColor="coolGray.50">
                <HStack space={3} alignItems="center">
                    <Icon as={MaterialCommunityIcons} name={icon} size="sm" color={PC_BLUE} />
                    <Text fontSize="md" color={color}>{label}</Text>
                </HStack>
                <Icon as={MaterialCommunityIcons} name="chevron-right" size="sm" color="coolGray.300" />
            </HStack>
        </Pressable>
    );

    return (
        <Box flex={1} bg="coolGray.50" safeAreaTop>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header Card */}
                <Box bg="white" p="6" alignItems="center">
                    <Avatar
                        size="xl"
                        bg={PC_BLUE}
                        source={{ uri: user?.avatar }}
                        mb="4"
                    >
                        {user?.name?.charAt(0) || 'U'}
                    </Avatar>
                    <Heading size="md" mb="1">{user?.name || 'User'}</Heading>
                    <Text color="coolGray.400">{user?.email || user?.phone || 'Loading...'}</Text>

                    <HStack mt="4" space={2} alignItems="center" bg="blue.50" px="3" py="1" rounded="full">
                        <Icon as={MaterialCommunityIcons} name="domain" size="xs" color={PC_BLUE} />
                        <Text fontSize="xs" fontWeight="bold" color={PC_BLUE}>
                            {user?.corpName || 'Aim.Link Workspace'}
                        </Text>
                    </HStack>
                </Box>

                <VStack mt="4" space="0.5">
                    <MenuItem icon="account-details-outline" label="Account Information" />
                    <MenuItem icon="translate" label="Language Settings" />
                    <MenuItem icon="bell-outline" label="Notifications" />
                    <Divider />
                    <MenuItem
                        icon="office-building"
                        label="Switch Workspace"
                        onPress={() => navigation.navigate('SelectCorp')}
                    />
                    <MenuItem icon="help-circle-outline" label="Help Center" />
                    <MenuItem icon="information-outline" label="About Aim.Link" />

                    <Box mt="8" px="5">
                        <Button
                            variant="outline"
                            colorScheme="danger"
                            onPress={handleLogout}
                            rounded="lg"
                            _text={{ fontWeight: "bold" }}
                        >
                            Log Out
                        </Button>
                        <Center mt="4">
                            <Text fontSize="10px" color="coolGray.300">Version 1.1.0 • Overseas Edition</Text>
                        </Center>
                    </Box>
                </VStack>
            </ScrollView>
        </Box>
    );
};

export default ProfileScreen;
