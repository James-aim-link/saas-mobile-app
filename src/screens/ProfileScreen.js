
import React, { useEffect, useState } from 'react';
import { Box, Button, Center, Heading, VStack, Text } from 'native-base';
import { storage } from '../utils/storage';
import { useNavigation } from '@react-navigation/native';

const ProfileScreen = () => {
    const [user, setUser] = useState(null);
    const navigation = useNavigation();

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        const u = await storage.getSession('user');
        setUser(u);
    };

    const handleLogout = async () => {
        await storage.clear();
        navigation.replace('Login');
    };

    return (
        <Center flex={1} bg="white">
            <VStack space={4} alignItems="center">
                <Heading>My Profile</Heading>
                {user ? (
                    <>
                        <Text>Name: {user.name || 'User'}</Text>
                        <Text>Email: {user.email || user.phone}</Text>
                    </>
                ) : (
                    <Text>Loading...</Text>
                )}
                <Button colorScheme="danger" onPress={handleLogout}>
                    Logout
                </Button>
            </VStack>
        </Center>
    );
};

export default ProfileScreen;
