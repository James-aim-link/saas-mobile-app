
import React, { useState, useRef } from 'react';
import {
    Box, Button, Center, Heading, VStack,
    FormControl, useToast, HStack, Text, Icon
} from 'native-base';
import {
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
    ScrollView,
    TextInput,
    StyleSheet,
    Pressable,
    ActivityIndicator
} from 'react-native';
import { POST } from '../utils/ajax';
import { storage } from '../utils/storage';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const passwordRef = useRef(null);
    const navigation = useNavigation();
    const toast = useToast();

    const handleLogin = async () => {
        if (!email || !password) {
            toast.show({
                render: () => (
                    <Box bg="red.500" px="4" py="2" rounded="md" mb={5}>
                        <Text color="white">Please enter account and password</Text>
                    </Box>
                )
            });
            return;
        }

        setLoading(true);
        try {
            console.log('Attempting login for:', email);

            const loginEndpoint = 'user/login';
            const standaloneEndpoint = 'standalone/user/login';

            const payload = {
                account: email,
                email: email,
                password: password,
                source: 'standalone'
            };

            let res;
            try {
                // Try standard login first
                res = await POST(loginEndpoint, payload);
                console.log('Standard login response:', JSON.stringify(res));
            } catch (e) {
                console.log('Standard login failed, trying standalone endpoint...', e.message);
                // If standard fails, try standalone (common for email-based overseas accounts)
                res = await POST(standaloneEndpoint, payload);
                console.log('Standalone login response:', JSON.stringify(res));
            }

            // Standardize response extraction
            const loginData = res?.userLoginResponse || res?.data?.userLoginResponse || res?.data || res;

            if (loginData && (loginData.token || (res?.code === 200 && res?.data?.token))) {
                const token = loginData.token || res?.data?.token;
                console.log('Login success, saving session...');
                await storage.setSession('token', token);
                await storage.setSession('user', loginData);

                const corpId = loginData.lastCorpId || loginData.corpId || (loginData.corpList && loginData.corpList[0]?.id);
                const hasMultipleCorps = loginData.corpList && loginData.corpList.length > 1;

                if (corpId && !hasMultipleCorps) {
                    await storage.setSession('corpId', corpId);
                }

                toast.show({
                    render: () => (
                        <Box bg="green.500" px="4" py="2" rounded="md" mb={5}>
                            <Text color="white">Login Successful</Text>
                        </Box>
                    )
                });

                setTimeout(() => {
                    if (hasMultipleCorps) {
                        navigation.navigate('SelectCorp');
                    } else {
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'Main' }],
                        });
                    }
                }, 500);
            } else {
                console.error('Login failed - Unexpected response format:', res);
                const errorMsg = res?.msg || res?.message || "Invalid credentials or account type";
                toast.show({
                    render: () => (
                        <Box bg="red.500" px="4" py="2" rounded="md" mb={5}>
                            <Text color="white">{errorMsg}</Text>
                        </Box>
                    )
                });
            }

        } catch (error) {
            console.error('Final login error:', error);
            const errorMsg = error.response?.data?.msg || error.message || "Login failed";
            toast.show({
                render: () => (
                    <Box bg="red.500" px="4" py="2" rounded="md" mb={5}>
                        <Text color="white">{errorMsg}</Text>
                    </Box>
                )
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <Box flex={1} bg="white">
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    <ScrollView
                        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
                        keyboardShouldPersistTaps="handled"
                    >
                        <Center w="100%">
                            <Box p="6" py="8" w="100%" maxW="350">
                                <Center mb="10">
                                    <Box
                                        bg="indigo.600"
                                        p="4"
                                        rounded="2xl"
                                        mb="4"
                                        shadow={6}
                                    >
                                        <Heading size="xl" color="white" fontWeight="bold">
                                            A
                                        </Heading>
                                    </Box>
                                    <Heading size="xl" color="indigo.600" fontWeight="bold">
                                        Aim.Link
                                    </Heading>
                                    <Text color="coolGray.400" fontSize="xs" letterSpacing="lg" mt="1">
                                        WORK INTELLIGENTLY
                                    </Text>
                                </Center>

                                <VStack space={4} mt="4">
                                    <VStack space={2}>
                                        <Text color="muted.700" fontSize="xs" fontWeight="600">ACCOUNT</Text>
                                        <TextInput
                                            placeholder="Email or Phone"
                                            value={email}
                                            onChangeText={setEmail}
                                            autoCapitalize="none"
                                            autoCorrect={false}
                                            keyboardType="email-address"
                                            returnKeyType="next"
                                            onSubmitEditing={() => passwordRef.current?.focus()}
                                            style={styles.input}
                                            placeholderTextColor="#9ca3af"
                                        />
                                    </VStack>

                                    <VStack space={2}>
                                        <Text color="muted.700" fontSize="xs" fontWeight="600">PASSWORD</Text>
                                        <TextInput
                                            ref={passwordRef}
                                            placeholder="Enter Password"
                                            value={password}
                                            onChangeText={setPassword}
                                            secureTextEntry
                                            autoCapitalize="none"
                                            autoCorrect={false}
                                            returnKeyType="done"
                                            onSubmitEditing={handleLogin}
                                            style={styles.input}
                                            placeholderTextColor="#9ca3af"
                                        />
                                        <Pressable style={{ alignSelf: 'flex-end', marginTop: 4 }}>
                                            <Text style={{ fontSize: 12, color: '#4f46e5', fontWeight: '600' }}>
                                                Forgot Password?
                                            </Text>
                                        </Pressable>
                                    </VStack>

                                    <Button
                                        mt="6"
                                        colorScheme="indigo"
                                        onPress={handleLogin}
                                        isLoading={loading}
                                        rounded="xl"
                                        py="4"
                                        shadow={4}
                                        _text={{ fontWeight: "bold", fontSize: "md" }}
                                    >
                                        Sign In
                                    </Button>

                                    <HStack mt="8" justifyContent="center" space={1}>
                                        <Text fontSize="sm" color="coolGray.600">
                                            New here?
                                        </Text>
                                        <Pressable>
                                            <Text style={{ fontWeight: 'bold', color: '#4f46e5', fontSize: 14 }}>
                                                Create Account
                                            </Text>
                                        </Pressable>
                                    </HStack>
                                </VStack>
                            </Box>
                        </Center>
                    </ScrollView>
                </KeyboardAvoidingView>
            </Box>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    input: {
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#111827',
    }
});

export default LoginScreen;
