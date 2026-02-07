
import React from 'react';
import { NativeBaseProvider, Icon } from 'native-base';
import { theme } from './src/utils/theme';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform, BackHandler } from 'react-native';
import './src/i18n';

// Polyfill for PlatformConstants which is expected by older libraries like native-base
if (Platform.OS === 'android') {
    if (typeof global.__TurboModuleProxy !== 'undefined' && !global.PlatformConstants) {
        global.PlatformConstants = Platform.constants;
    }
}

// Polyfill for BackHandler.removeEventListener which was removed in newer RN versions but used by native-base
if (BackHandler && !BackHandler.removeEventListener) {
    BackHandler.removeEventListener = () => { };
}

// Placeholder Screens
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import WorkbenchScreen from './src/screens/WorkbenchScreen';
import ProjectScreen from './src/screens/ProjectScreen';
import ProjectMapScreen from './src/screens/ProjectMapScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import TasksTabScreen from './src/screens/TasksTabScreen';
import TaskListScreen from './src/screens/TaskListScreen';
import TaskDetailScreen from './src/screens/TaskDetailScreen';
import MapDetailScreen from './src/screens/MapDetailScreen';
import SelectCorpScreen from './src/screens/SelectCorpScreen';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    if (route.name === 'Index') iconName = focused ? 'calendar-check' : 'calendar-check-outline';
                    else if (route.name === 'Projects') iconName = focused ? 'folder' : 'folder-outline';
                    else if (route.name === 'Tasks') iconName = focused ? 'clipboard-list' : 'clipboard-list-outline';
                    else if (route.name === 'Maps') iconName = focused ? 'sitemap' : 'sitemap-outline';
                    else if (route.name === 'Mine') iconName = focused ? 'account-circle' : 'account-circle-outline';

                    return <Icon as={MaterialCommunityIcons} name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#1890ff',
                tabBarInactiveTintColor: 'gray',
            })}
        >
            <Tab.Screen name="Index" component={HomeScreen} options={{ title: 'Todo' }} />
            <Tab.Screen name="Projects" component={ProjectScreen} options={{ title: 'Projects' }} />
            <Tab.Screen name="Tasks" component={TasksTabScreen} options={{ title: 'Tasks' }} />
            <Tab.Screen name="Maps" component={ProjectMapScreen} options={{ title: 'Maps' }} />
            <Tab.Screen name="Mine" component={ProfileScreen} options={{ title: 'Mine' }} />
        </Tab.Navigator>
    );
}

function App() {
    return (
        <SafeAreaProvider>
            <NativeBaseProvider theme={theme}>
                <NavigationContainer>
                    <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
                        <Stack.Screen name="Login" component={LoginScreen} />
                        <Stack.Screen name="SelectCorp" component={SelectCorpScreen} />
                        <Stack.Screen name="Main" component={MainTabNavigator} />
                        <Stack.Screen name="TaskList" component={TaskListScreen} />
                        <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
                        <Stack.Screen name="ProjectMap" component={ProjectMapScreen} />
                        <Stack.Screen name="MapDetail" component={MapDetailScreen} />
                    </Stack.Navigator>
                </NavigationContainer>
            </NativeBaseProvider>
        </SafeAreaProvider>
    );
}

export default App;
