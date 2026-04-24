import { useState } from "react";
import { useTheme } from "react-native-paper";
import { Card, Text, IconButton, Portal, Modal, Chip } from "react-native-paper";
import { View, StyleSheet, ImageBackground, ScrollView, ActivityIndicator } from "react-native";
import * as SecureStore from "@/utils/SecureStore";

interface GameDetails {
    name: string;
    background_image: string | null;
    released: string | null;
    platforms: { platform: { name: string } }[];
    developers: { name: string }[];
    publishers: { name: string }[];
    genres: { name: string }[];
}

interface GameItemData {
    id: string;
    game_id?: number;
    background_image: string | null;
    name: string;
    votes: number;
}

interface Props {
    item: GameItemData;
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
        if (!item.game_id) return;
        setLoadingDetails(true);
        try {
            const response = await fetch(
                `${process.env.EXPO_PUBLIC_API_URL}/gameDetails?game_id=${item.game_id}`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${await SecureStore.getItemAsync("token")}`,
                    },
                },
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
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const modalStyle = [
        styles.modalContainer,
        { backgroundColor: theme.colors.surface },
    ];

    return (
        <>
            <Card style={styles.card} onPress={handleInfoPress}>
                <ImageBackground
                    source={{ uri: imageUri }}
                    style={styles.imageBackground}
                    resizeMode="cover"
                >
                    <View style={styles.overlay}>
                        <View style={styles.titleRow}>
                            <Text style={styles.title} numberOfLines={2}>
                                {item.name}
                            </Text>
                            <IconButton
                                icon="chevron-right"
                                iconColor="rgba(255,255,255,0.7)"
                                size={20}
                                onPress={handleInfoPress}
                                style={styles.infoButton}
                            />
                        </View>
                        <View style={styles.bottomRow}>
                            <View style={styles.voteBadge}>
                                <IconButton
                                    icon="thumb-up"
                                    iconColor="rgba(255,255,255,0.8)"
                                    size={14}
                                    style={styles.voteIcon}
                                />
                                <Text style={styles.votes}>{item.votes}</Text>
                            </View>
                        </View>
                    </View>
                </ImageBackground>
            </Card>

            <Portal>
                <Modal
                    visible={isModalVisible}
                    onDismiss={() => setIsModalVisible(false)}
                    contentContainerStyle={modalStyle}
                >
                    <ScrollView showsVerticalScrollIndicator={false}>
                        {gameDetails?.background_image ? (
                            <ImageBackground
                                source={{ uri: gameDetails.background_image }}
                                style={styles.modalImage}
                                resizeMode="cover"
                            >
                                <View style={styles.modalImageOverlay}>
                                    <Text style={styles.modalTitle} numberOfLines={2}>
                                        {gameDetails.name}
                                    </Text>
                                </View>
                            </ImageBackground>
                        ) : (
                            <View style={[styles.modalHeaderFallback, { backgroundColor: theme.colors.surfaceVariant }]}>
                                <Text style={[styles.modalTitleDark, { color: theme.colors.onSurface }]} numberOfLines={2}>
                                    {item.name}
                                </Text>
                            </View>
                        )}

                        {loadingDetails ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="small" color={theme.colors.primary} />
                                <Text style={[styles.loadingText, { color: theme.colors.onSurfaceVariant }]}>Loading details...</Text>
                            </View>
                        ) : (
                            <View style={styles.detailsContainer}>
                                <View style={styles.detailRow}>
                                    <Text style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>Released</Text>
                                    <Text style={[styles.detailValue, { color: theme.colors.onSurface }]}>
                                        {formatDate(gameDetails?.released)}
                                    </Text>
                                </View>

                                {gameDetails?.developers && gameDetails.developers.length > 0 && (
                                    <View style={styles.detailRow}>
                                        <Text style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>Developer</Text>
                                        <Text style={[styles.detailValue, { color: theme.colors.onSurface }]}>
                                            {gameDetails.developers.map((d) => d.name).join(", ")}
                                        </Text>
                                    </View>
                                )}

                                {gameDetails?.publishers && gameDetails.publishers.length > 0 && (
                                    <View style={styles.detailRow}>
                                        <Text style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>Publisher</Text>
                                        <Text style={[styles.detailValue, { color: theme.colors.onSurface }]}>
                                            {gameDetails.publishers.map((p) => p.name).join(", ")}
                                        </Text>
                                    </View>
                                )}

                                {gameDetails?.platforms && gameDetails.platforms.length > 0 && (
                                    <View style={styles.detailSection}>
                                        <Text style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>Platforms</Text>
                                        <View style={styles.chipContainer}>
                                            {gameDetails.platforms.map((p, index) => (
                                                <Chip
                                                    key={index}
                                                    compact
                                                    style={styles.chip}
                                                    textStyle={styles.chipText}
                                                >
                                                    {p.platform.name}
                                                </Chip>
                                            ))}
                                        </View>
                                    </View>
                                )}

                                {gameDetails?.genres && gameDetails.genres.length > 0 && (
                                    <View style={styles.detailSection}>
                                        <Text style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>Genres</Text>
                                        <View style={styles.chipContainer}>
                                            {gameDetails.genres.map((g, index) => (
                                                <Chip
                                                    key={index}
                                                    compact
                                                    style={styles.chip}
                                                    textStyle={styles.chipText}
                                                >
                                                    {g.name}
                                                </Chip>
                                            ))}
                                        </View>
                                    </View>
                                )}
                            </View>
                        )}
                    </ScrollView>
                </Modal>
            </Portal>
        </>
    );
}

const styles = StyleSheet.create({
    card: {
        marginHorizontal: 16,
        marginVertical: 6,
        borderRadius: 16,
        overflow: "hidden",
        elevation: 2,
    },
    imageBackground: {
        height: 180,
    },
    overlay: {
        flex: 1,
        justifyContent: "space-between",
        padding: 16,
        backgroundColor: "rgba(0,0,0,0.35)",
    },
    titleRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
    },
    title: {
        fontSize: 17,
        fontWeight: "600",
        color: "#fff",
        flex: 1,
        lineHeight: 22,
    },
    infoButton: {
        margin: -8,
    },
    bottomRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    voteBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.15)",
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    voteIcon: {
        margin: 0,
        marginLeft: -4,
    },
    votes: {
        fontSize: 13,
        fontWeight: "500",
        color: "rgba(255,255,255,0.9)",
    },
    modalContainer: {
        margin: 24,
        borderRadius: 20,
        overflow: "hidden",
        maxHeight: "80%",
    },
    modalImage: {
        height: 180,
    },
    modalImageOverlay: {
        flex: 1,
        justifyContent: "flex-end",
        padding: 20,
        backgroundColor: "rgba(0,0,0,0.4)",
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: "700",
        color: "#fff",
        lineHeight: 28,
    },
    modalHeaderFallback: {
        padding: 20,
    },
    modalTitleDark: {
        fontSize: 22,
        fontWeight: "700",
        lineHeight: 28,
    },
    loadingContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
        gap: 10,
    },
    loadingText: {
        fontSize: 14,
    },
    detailsContainer: {
        padding: 20,
        gap: 14,
    },
    detailRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    detailSection: {
        gap: 6,
    },
    detailLabel: {
        fontSize: 12,
        fontWeight: "500",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    detailValue: {
        fontSize: 15,
        fontWeight: "400",
        flex: 1,
        textAlign: "right",
    },
    chipContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 6,
    },
    chip: {},
    chipText: {
        fontSize: 12,
    },
});
