
import React, { useEffect, useState } from 'react';
import {
    Box, VStack, HStack, Text, Heading,
    Pressable, Icon, Spinner, Center, Avatar,
    ScrollView
} from 'native-base';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { storage } from '../utils/storage';
import { useNavigation } from '@react-navigation/native';

const PC_BLUE = '#1890ff';

const SelectCorpScreen = () => {
    const navigation = useNavigation();
    const [user, setUser] = useState(null);
    const [corpList, setCorpList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const userData = await storage.getSession('user');
            setUser(userData);
            setCorpList(userData?.corpList || []);
        } catch (e) {
            console.error('Load corp list error', e);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = async (corp) => {
        try {
            console.log('Selecting organization:', corp.name, corp.id);
            await storage.setSession('corpId', corp.id);

            // Update user object with selected corp info for immediate UI update
            const updatedUser = { ...user, corpId: corp.id, corpName: corp.name };
            await storage.setSession('user', updatedUser);

            navigation.reset({
                index: 0,
                routes: [{ name: 'Main' }],
            });
        } catch (e) {
            console.error('Select corp error', e);
        }
    };

    if (loading) {
        return <Center flex={1} bg="white"><Spinner color={PC_BLUE} /></Center>;
    }

    return (
        <Box flex={1} bg="coolGray.50" safeArea>
            <VStack p="6" space={8} flex={1}>
                <VStack space={2}>
                    <Heading size="xl" color="coolGray.800">Select Workspace</Heading>
                    <Text color="coolGray.500">Please choose an organization to continue</Text>
                </VStack>

                <ScrollView showsVerticalScrollIndicator={false}>
                    <VStack space={4}>
                        {corpList.map((corp) => (
                            <Pressable
                                key={corp.id}
                                onPress={() => handleSelect(corp)}
                            >
                                {({ isPressed }) => (
                                    <Box
                                        bg={isPressed ? "coolGray.100" : "white"}
                                        p="5"
                                        rounded="xl"
                                        shadow={2}
                                        borderWidth={corp.id === user?.lastCorpId ? 2 : 1}
                                        borderColor={corp.id === user?.lastCorpId ? PC_BLUE : "coolGray.100"}
                                    >
                                        <HStack space={4} alignItems="center">
                                            <Avatar
                                                bg={PC_BLUE}
                                                size="md"
                                                _text={{ fontWeight: 'bold' }}
                                            >
                                                {corp.name?.charAt(0)}
                                            </Avatar>
                                            <VStack flex={1}>
                                                <Heading size="sm" color="coolGray.800">
                                                    {corp.name}
                                                </Heading>
                                                <HStack space={2} alignItems="center">
                                                    <Badge colorScheme="blue" variant="subtle" rounded="sm" _text={{ fontSize: '10px' }}>
                                                        {corp.buyVersion || 'Standard'}
                                                    </Badge>
                                                    {corp.id === user?.lastCorpId && (
                                                        <Text fontSize="10px" color={PC_BLUE} fontWeight="600">
                                                            Last Visited
                                                        </Text>
                                                    )}
                                                </HStack>
                                            </VStack>
                                            <Icon
                                                as={MaterialCommunityIcons}
                                                name="chevron-right"
                                                size="sm"
                                                color="coolGray.300"
                                            />
                                        </HStack>
                                    </Box>
                                )}
                            </Pressable>
                        ))}
                    </VStack>

                    <Box mt="10" alignItems="center">
                        <Pressable onPress={() => navigation.navigate('Login')}>
                            <Text color={PC_BLUE} fontWeight="600">Login with another account</Text>
                        </Pressable>
                    </Box>
                </ScrollView>
            </VStack>
        </Box>
    );
};

// Helper components missing in native-base for this specific view
const Badge = ({ children, colorScheme, variant, rounded, _text }) => (
    <Box bg={`${colorScheme}.100`} px="2" py="0.5" rounded={rounded || "md"}>
        <Text color={`${colorScheme}.700`} fontSize={_text?.fontSize || "xs"} fontWeight={_text?.fontWeight || "normal"}>
            {children}
        </Text>
    </Box>
);

export default SelectCorpScreen;
