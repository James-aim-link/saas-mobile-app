
import React, { useState } from 'react';
import { Box, Button, Center, Heading, Input, VStack, FormControl, useToast } from 'native-base';
import { POST } from '../utils/ajax';
import { storage } from '../utils/storage';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();
    const toast = useToast();
    const { t } = useTranslation();

    const handleLogin = async () => {
        if (!email || !password) {
            toast.show({ description: "Please enter email and password" });
            return;
        }

        setLoading(true);
        try {
            // API call to login
            // Replacing with actual endpoint from PC4.0: standalone/user/login
            const res = await POST('standalone/user/login', {
                email: email,
                password: password
            });

            if (res && res.userLoginResponse) {
                // Save session
                await storage.setSession('token', res.userLoginResponse.token);
                await storage.setSession('user', res.userLoginResponse);
                if (res.userLoginResponse.corpId) {
                    await storage.setSession('corpId', res.userLoginResponse.corpId);
                }

                toast.show({ description: "Login Successful" });
                navigation.replace('Main');
            } else {
                toast.show({ description: "Login failed" });
            }

        } catch (error) {
            toast.show({ description: error.message || "Login failed" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Center w="100%" flex={1} bg="white">
            <Box safeArea p="2" py="8" w="90%" maxW="290">
                <Heading size="lg" fontWeight="600" color="coolGray.800">
                    Welcome
                </Heading>
                <Heading mt="1" _text={{ color: "muted.400" }} fontWeight="medium" size="xs">
                    Sign in to continue!
                </Heading>

                <VStack space={3} mt="5">
                    <FormControl>
                        <FormControl.Label>Email</FormControl.Label>
                        <Input value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
                    </FormControl>
                    <FormControl>
                        <FormControl.Label>Password</FormControl.Label>
                        <Input type="password" value={password} onChangeText={setPassword} />
                    </FormControl>
                    <Button mt="2" colorScheme="indigo" onPress={handleLogin} isLoading={loading}>
                        Sign in
                    </Button>
                </VStack>
            </Box>
        </Center>
    );
};

export default LoginScreen;
