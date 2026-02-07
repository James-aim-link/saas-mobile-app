
import React, { useState } from 'react';
import { Box, Button, Center, Heading, Input, VStack, FormControl, useToast, HStack, Text } from 'native-base';
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
            <Box safeArea p="6" py="8" w="100%" maxW="350">
                <Center mb="10">
                    <Heading size="2xl" color="indigo.600" fontWeight="bold">
                        Aim.Link
                    </Heading>
                    <Heading size="xs" color="coolGray.400" mt="1" letterSpacing="lg">
                        WORK INTELLIGENTLY
                    </Heading>
                </Center>

                <Heading size="lg" fontWeight="600" color="coolGray.800">
                    Welcome Back
                </Heading>
                <Heading mt="1" _text={{ color: "muted.400" }} fontWeight="medium" size="xs">
                    Sign in to your account
                </Heading>

                <VStack space={4} mt="8">
                    <FormControl>
                        <FormControl.Label _text={{ color: 'muted.700', fontSize: 'xs', fontWeight: 600 }}>
                            EMAIL / PHONE
                        </FormControl.Label>
                        <Input
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            variant="filled"
                            bg="coolGray.100"
                            _focus={{ bg: "white", borderColor: "indigo.500" }}
                            py="3"
                            rounded="md"
                        />
                    </FormControl>
                    <FormControl>
                        <FormControl.Label _text={{ color: 'muted.700', fontSize: 'xs', fontWeight: 600 }}>
                            PASSWORD
                        </FormControl.Label>
                        <Input
                            type="password"
                            value={password}
                            onChangeText={setPassword}
                            variant="filled"
                            bg="coolGray.100"
                            _focus={{ bg: "white", borderColor: "indigo.500" }}
                            py="3"
                            rounded="md"
                        />
                        <Button variant="link" alignSelf="flex-end" mt="1" _text={{ fontSize: "xs", color: "indigo.500" }}>
                            Forgot Password?
                        </Button>
                    </FormControl>

                    <Button
                        mt="4"
                        colorScheme="indigo"
                        onPress={handleLogin}
                        isLoading={loading}
                        rounded="full"
                        size="lg"
                        shadow={3}
                        _text={{ fontWeight: "bold" }}
                    >
                        Sign In
                    </Button>

                    <HStack mt="6" justifyContent="center">
                        <Text fontSize="sm" color="coolGray.600">
                            Don't have an account?{" "}
                        </Text>
                        <Button variant="link" p="0" _text={{ color: "indigo.500", fontWeight: "bold", fontSize: "sm" }}>
                            Sign Up
                        </Button>
                    </HStack>
                </VStack>
            </Box>
        </Center>
    );
};

export default LoginScreen;
