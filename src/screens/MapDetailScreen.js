
import React, { useState, useEffect } from 'react';
import {
    Box, Text, VStack, HStack, ScrollView, Pressable,
    Heading, Icon, Spinner, Center, Divider, Collapse, IconButton, Button,
    Actionsheet, useDisclose, Modal, FormControl, Input, useToast
} from 'native-base';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getMindDetail, addMindNode, updateMindNode, deleteMindNode } from '../api/mind_v2';
import { useRoute, useNavigation } from '@react-navigation/native';

const PC_BLUE = '#1890ff';

const TreeNode = ({ node, level = 0, onAdd, onEdit, onDelete }) => {
    const [isExpanded, setIsExpanded] = useState(level < 1);
    const hasChildren = node.children && node.children.length > 0;

    return (
        <VStack>
            <HStack
                alignItems="center"
                py="3"
                pl={level * 4 + 4}
                bg={level === 0 ? "blue.50" : "transparent"}
                borderBottomWidth={1}
                borderBottomColor="coolGray.50"
            >
                <Pressable onPress={() => hasChildren && setIsExpanded(!isExpanded)} flex={1}>
                    <HStack alignItems="center">
                        {hasChildren ? (
                            <Icon
                                as={MaterialCommunityIcons}
                                name={isExpanded ? "chevron-down" : "chevron-right"}
                                size="xs"
                                color="coolGray.400"
                                mr="2"
                            />
                        ) : (
                            <Box w="4" mr="2" />
                        )}

                        <Icon
                            as={MaterialCommunityIcons}
                            name={node.type === 'folder' ? "folder" : "checkbox-blank-circle-outline"}
                            size="xs"
                            color={node.type === 'folder' ? "amber.400" : PC_BLUE}
                            mr="2"
                        />

                        <VStack flex={1}>
                            <Text
                                fontSize={level === 0 ? "md" : "sm"}
                                fontWeight={level === 0 ? "bold" : "normal"}
                                color="coolGray.800"
                            >
                                {node.name || node.title || 'Branch'}
                            </Text>
                            {node.executorName && (
                                <Text fontSize="2xs" color="coolGray.400">
                                    {node.executorName}
                                </Text>
                            )}
                        </VStack>
                    </HStack>
                </Pressable>

                <HStack space={1} pr="2">
                    <IconButton
                        size="sm"
                        variant="ghost"
                        onPress={() => onAdd(node)}
                        icon={<Icon as={MaterialCommunityIcons} name="plus" size="xs" color={PC_BLUE} />}
                    />
                    <IconButton
                        size="sm"
                        variant="ghost"
                        onPress={() => onEdit(node)}
                        icon={<Icon as={MaterialCommunityIcons} name="pencil-outline" size="xs" color="coolGray.400" />}
                    />
                    {level > 0 && (
                        <IconButton
                            size="sm"
                            variant="ghost"
                            onPress={() => onDelete(node)}
                            icon={<Icon as={MaterialCommunityIcons} name="close" size="xs" color="red.400" />}
                        />
                    )}
                </HStack>
            </HStack>

            {hasChildren && (
                <Collapse isOpen={isExpanded}>
                    <VStack>
                        {node.children.map((child, index) => (
                            <TreeNode
                                key={child.id || index}
                                node={child}
                                level={level + 1}
                                onAdd={onAdd}
                                onEdit={onEdit}
                                onDelete={onDelete}
                            />
                        ))}
                    </VStack>
                </Collapse>
            )}
        </VStack>
    );
};

const MapDetailScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const toast = useToast();
    const { mapId, mapName } = route.params;

    const [treeData, setTreeData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Node Modal
    const { isOpen, onOpen, onClose } = useDisclose();
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
    const [selectedNode, setSelectedNode] = useState(null);
    const [nodeName, setNodeName] = useState('');

    useEffect(() => {
        if (mapId) fetchDetail();
    }, [mapId]);

    const fetchDetail = async () => {
        setLoading(true);
        try {
            const res = await getMindDetail(mapId);
            setTreeData(res);
        } catch (error) {
            console.error('MapDetail fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleNodeAction = async () => {
        if (!nodeName) return;
        try {
            if (modalMode === 'add') {
                await addMindNode({
                    mindMapId: mapId,
                    parentId: selectedNode.id,
                    name: nodeName
                });
                toast.show({ description: "Node added" });
            } else {
                await updateMindNode({
                    id: selectedNode.id,
                    name: nodeName
                });
                toast.show({ description: "Node updated" });
            }
            onClose();
            fetchDetail();
        } catch (e) {
            toast.show({ description: "Action failed", status: "error" });
        }
    };

    const handleDeleteNode = async (node) => {
        try {
            await deleteMindNode({ id: node.id });
            toast.show({ description: "Node deleted" });
            fetchDetail();
        } catch (e) {
            toast.show({ description: "Delete failed", status: "error" });
        }
    };

    const openAdd = (node) => {
        setModalMode('add');
        setSelectedNode(node);
        setNodeName('');
        onOpen();
    };

    const openEdit = (node) => {
        setModalMode('edit');
        setSelectedNode(node);
        setNodeName(node.name || node.title);
        onOpen();
    };

    return (
        <Box flex={1} bg="white" safeAreaTop>
            <Box px="4" py="3" bg="white" borderBottomWidth={1} borderBottomColor="coolGray.100">
                <HStack space={3} alignItems="center">
                    <Pressable onPress={() => navigation.goBack()}>
                        <Icon as={MaterialCommunityIcons} name="arrow-left" size="sm" color="coolGray.800" />
                    </Pressable>
                    <VStack flex={1}>
                        <Heading size="sm" isTruncated>{mapName}</Heading>
                        <Text fontSize="10px" color="coolGray.400">Map Editor</Text>
                    </VStack>
                    <Pressable onPress={fetchDetail}>
                        <Icon as={MaterialCommunityIcons} name="refresh" size="sm" color={PC_BLUE} />
                    </Pressable>
                </HStack>
            </Box>

            {loading ? (
                <Center flex={1}>
                    <Spinner color={PC_BLUE} />
                </Center>
            ) : (
                <ScrollView flex={1}>
                    {treeData ? (
                        <TreeNode
                            node={treeData}
                            onAdd={openAdd}
                            onEdit={openEdit}
                            onDelete={handleDeleteNode}
                        />
                    ) : (
                        <Center mt="20">
                            <Text color="coolGray.400">No data found</Text>
                        </Center>
                    )}
                    <Box h="20" />
                </ScrollView>
            )}

            <Modal isOpen={isOpen} onClose={onClose}>
                <Modal.Content>
                    <Modal.Header>{modalMode === 'add' ? 'Add Child Node' : 'Edit Node'}</Modal.Header>
                    <Modal.Body>
                        <FormControl>
                            <FormControl.Label>Node Name</FormControl.Label>
                            <Input value={nodeName} onChangeText={setNodeName} autoFocus />
                        </FormControl>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button.Group space={2}>
                            <Button variant="ghost" onPress={onClose}>Cancel</Button>
                            <Button bg={PC_BLUE} onPress={handleNodeAction}>
                                {modalMode === 'add' ? 'Add' : 'Save'}
                            </Button>
                        </Button.Group>
                    </Modal.Footer>
                </Modal.Content>
            </Modal>
        </Box>
    );
};

export default MapDetailScreen;
