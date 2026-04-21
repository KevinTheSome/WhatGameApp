import { useState } from "react";
import { useTheme } from "react-native-paper";
import { Card, Text, IconButton, Portal, Modal, Button, Chip, Divider } from "react-native-paper";
import { View, StyleSheet, ImageBackground, ScrollView } from "react-native";
import { BlurView } from "expo-blur";

interface GameDetails {
    name: string;
    background_image: string | null;
    released: string | null;
    platforms: { platform: { name: string } }[];
    developers: { name: string }[];
    publishers: { name: string }[];
    genres: { name: string }[];
}

interface GameItem {
    id: string;
    game_id?: number;
    background_image: string | null;
    name: string;
    votes: number;
}

interface Props {
    item: GameItem;
}

export default function GameItem({ item }: Props) {
    const theme = useTheme();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [gameDetails, setGameDetails] = useState<GameDetails | null>(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    const imageUri =
        item.background_image ||
        "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=200&fit=crop";

    const fetchGameDetails = async () => {
        if (!item.game_id) {
            return;
        }
        setLoadingDetails(true);
        try {
            const response = await fetch(
                `${process.env.EXPO_PUBLIC_API_URL}/gameDetails?game_id=${item.game_id}`,
            );
            const data = await response.json();
            if (data.error) {
                console.error("Failed to fetch game details:", data.error);
                setLoadingDetails(false);
                return;
            }
            setGameDetails({
                name: data.name,
                background_image: data.background_image,
                released: data.released,
                platforms: data.platforms || [],
                developers: data.developers || [],
                publishers: data.publishers || [],
                genres: data.genres || [],
            });
        } catch (error) {
            console.error("Failed to fetch game details:", error);
        }
        setLoadingDetails(false);
    };

    const handleInfoPress = () => {
        setIsModalVisible(true);
        if (!gameDetails && item.game_id) {
            fetchGameDetails();
        }
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "Unknown";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    return (
        <>
            <Card style={styles.card}>
                <Card.Content style={styles.content}>
                    <ImageBackground
                        source={{ uri: imageUri }}
                        style={styles.imageBackground}
                        resizeMode="cover"
                    >
                        <BlurView
                            intensity={10}
                            tint="dark"
                            experimentalBlurMethod="dimezisBlurView"
                            style={styles.blurView}
                        >
                            <View style={styles.overlay}>
                                <Text style={styles.title} numberOfLines={2}>
                                    {item.name}
                                </Text>
                                <View style={styles.bottomRow}>
                                    <Text
                                        style={styles.votes}
                                    >{`${item.votes} votes`}</Text>
                                    <IconButton
                                        icon="information"
                                        iconColor={theme.colors.primary}
                                        size={24}
                                        onPress={handleInfoPress}
                                    />
                                </View>
                            </View>
                        </BlurView>
                    </ImageBackground>
                </Card.Content>
            </Card>

            <Portal>
                <Modal
                    visible={isModalVisible}
                    onDismiss={() => setIsModalVisible(false)}
                    contentContainerStyle={styles.modalContainer}
                >
                    <ScrollView>
                        {gameDetails?.background_image && (
                            <ImageBackground
                                source={{ uri: gameDetails.background_image }}
                                style={styles.modalImage}
                                resizeMode="cover"
                            >
                                <BlurView
                                    intensity={20}
                                    tint="dark"
                                    experimentalBlurMethod="dimezisBlurView"
                                    style={styles.modalImageBlur}
                                >
                                    <Text style={styles.modalTitle}>
                                        {gameDetails.name}
                                    </Text>
                                </BlurView>
                            </ImageBackground>
                        )}
                        {!gameDetails?.background_image && (
                            <Text style={styles.modalTitle}>{item.name}</Text>
                        )}

                        {loadingDetails ? (
                            <Text style={styles.modalText}>Loading...</Text>
                        ) : (
                            <>
                                <View style={styles.detailSection}>
                                    <Text style={styles.detailLabel}>Released</Text>
                                    <Text style={styles.detailValue}>
                                        {formatDate(gameDetails?.released)}
                                    </Text>
                                </View>

                                <Divider style={styles.divider} />

                                <View style={styles.detailSection}>
                                    <Text style={styles.detailLabel}>Platforms</Text>
                                    <View style={styles.chipContainer}>
                                        {gameDetails?.platforms?.map(
                                            (p, index) => (
                                                <Chip
                                                    key={index}
                                                    style={styles.chip}
                                                    textStyle={styles.chipText}
                                                >
                                                    {p.platform.name}
                                                </Chip>
                                            ),
                                        )}
                                    </View>
                                </View>

                                <Divider style={styles.divider} />

                                <View style={styles.detailSection}>
                                    <Text style={styles.detailLabel}>Developer</Text>
                                    <Text style={styles.detailValue}>
                                        {gameDetails?.developers
                                            ?.map((d) => d.name)
                                            .join(", ") || "Unknown"}
                                    </Text>
                                </View>

                                <Divider style={styles.divider} />

                                <View style={styles.detailSection}>
                                    <Text style={styles.detailLabel}>Publisher</Text>
                                    <Text style={styles.detailValue}>
                                        {gameDetails?.publishers
                                            ?.map((p) => p.name)
                                            .join(", ") || "Unknown"}
                                    </Text>
                                </View>

                                {gameDetails?.genres &&
                                    gameDetails.genres.length > 0 && (
                                        <>
                                            <Divider style={styles.divider} />
                                            <View style={styles.detailSection}>
                                                <Text style={styles.detailLabel}>
                                                    Genres
                                                </Text>
                                                <View style={styles.chipContainer}>
                                                    {gameDetails.genres.map(
                                                        (g, index) => (
                                                            <Chip
                                                                key={index}
                                                                style={styles.chip}
                                                                textStyle={
                                                                    styles.chipText
                                                                }
                                                            >
                                                                {g.name}
                                                            </Chip>
                                                        ),
                                                    )}
                                                </View>
                                            </View>
                                        </>
                                    )}
                            </>
                        )}

                        <Button
                            mode="contained"
                            onPress={() => setIsModalVisible(false)}
                            style={styles.closeButton}
                        >
                            Close
                        </Button>
                    </ScrollView>
                </Modal>
            </Portal>
        </>
    );
}

const styles = StyleSheet.create({
    card: {
        marginVertical: 8,
        borderRadius: 8,
        padding: 0,
    },
    content: {
        height: 200,
    },
    imageBackground: {
        flex: 1,
    },
    blurView: {
        flex: 1,
    },
    overlay: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: "600",
        color: "white",
        textShadowColor: "black",
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 2,
        flex: 1,
    },
    bottomRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    votes: {
        fontSize: 16,
        color: "white",
        textShadowColor: "black",
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 2,
    },
    modalContainer: {
        backgroundColor: "white",
        padding: 0,
        margin: 20,
        borderRadius: 8,
        maxHeight: "80%",
    },
    modalImage: {
        height: 200,
        justifyContent: "flex-end",
    },
    modalImageBlur: {
        height: "100%",
        justifyContent: "flex-end",
        padding: 16,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: "white",
        textShadowColor: "black",
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 2,
    },
    modalText: {
        fontSize: 16,
        color: "black",
        padding: 16,
    },
    detailSection: {
        padding: 16,
    },
    detailLabel: {
        fontSize: 12,
        color: "gray",
        marginBottom: 4,
    },
    detailValue: {
        fontSize: 16,
        color: "black",
    },
    chipContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginTop: 4,
    },
    chip: {
        marginBottom: 0,
    },
    chipText: {
        fontSize: 12,
    },
    divider: {
        marginHorizontal: 16,
    },
    closeButton: {
        margin: 16,
    },
});
