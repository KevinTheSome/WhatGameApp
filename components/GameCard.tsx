import { View, StyleSheet, ImageBackground, ScrollView, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import { Text, Card, IconButton, useTheme, Portal, Modal, Chip } from "react-native-paper";
import * as SecureStore from "@/utils/SecureStore";

interface GameDetails {
    name: string;
    background_image: string | null;
    released: string | null;
    metacritic: number | null;
    rating: number | null;
    platforms: { platform: { name: string } }[];
    developers: { name: string }[];
    publishers: { name: string }[];
    genres: { name: string }[];
}

interface GameData {
    id: number;
    background_image: string | null;
    name: string;
    favorited: boolean;
}

interface Props {
    game: GameData;
    onFavorite: (game: GameData, favorited: boolean) => void;
}

export default function GameCard({ game, onFavorite }: Props) {
    const theme = useTheme();
    const [favorites, setFavorites] = useState(game.favorited);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [gameDetails, setGameDetails] = useState<GameDetails | null>(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    useEffect(() => {
        setFavorites(game.favorited);
    }, [game.favorited]);

    async function handleFavorites() {
        const oldFavorites = favorites;
        const newFavorites = !favorites;
        setFavorites(newFavorites);
        try {
            const response = await fetch(
                process.env.EXPO_PUBLIC_API_URL + "/addToFavourites",
                {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${await SecureStore.getItemAsync("token")}`,
                    },
                    body: JSON.stringify({ game_id: game.id }),
                },
            );
            const data = await response.json();
            if (data["error"] != null) {
                setFavorites(oldFavorites);
            } else {
                onFavorite(game, newFavorites);
            }
        } catch (error) {
            setFavorites(oldFavorites);
            console.error(error);
        }
    }

    const fetchGameDetails = async () => {
        setLoadingDetails(true);
        try {
            const response = await fetch(
                `${process.env.EXPO_PUBLIC_API_URL}/gameDetails?game_id=${game.id}`,
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
                metacritic: data.metacritic,
                rating: data.rating,
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
        if (!gameDetails) {
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

    const getScoreColor = (score: number) => {
        if (score >= 75) return "#4caf50";
        if (score >= 50) return "#ff9800";
        return "#f44336";
    };

    const modalStyle = [
        styles.modalContainer,
        { backgroundColor: theme.colors.surface },
    ];

    return (
        <>
            <Card style={styles.card} onPress={handleInfoPress}>
                <ImageBackground
                    source={{ uri: game.background_image || undefined }}
                    style={styles.imageBackground}
                    resizeMode="cover"
                >
                    <View style={styles.overlay}>
                        <Text style={styles.title} numberOfLines={2}>
                            {game.name}
                        </Text>
                        <View style={styles.actionRow}>
                            <IconButton
                                icon="information-outline"
                                iconColor="rgba(255,255,255,0.8)"
                                size={22}
                                onPress={handleInfoPress}
                                style={styles.actionButton}
                            />
                            <IconButton
                                icon={favorites ? "heart" : "heart-outline"}
                                iconColor={favorites ? "#ef4444" : "rgba(255,255,255,0.7)"}
                                size={26}
                                onPress={handleFavorites}
                                style={styles.actionButton}
                            />
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
                                    {game.name}
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
                                {(gameDetails?.metacritic || gameDetails?.rating) && (
                                    <View style={[styles.scoreRow, { borderBottomColor: theme.colors.outlineVariant }]}>
                                        {gameDetails?.metacritic != null && (
                                            <View style={[styles.scoreBadge, { borderColor: getScoreColor(gameDetails.metacritic) }]}>
                                                <Text style={[styles.scoreValue, { color: getScoreColor(gameDetails.metacritic) }]}>
                                                    {gameDetails.metacritic}
                                                </Text>
                                                <Text style={[styles.scoreLabel, { color: theme.colors.onSurfaceVariant }]}>Metacritic</Text>
                                            </View>
                                        )}
                                        {gameDetails?.rating != null && (
                                            <View style={styles.scoreBadge}>
                                                <Text style={styles.scoreValueAlt}>
                                                    {gameDetails.rating.toFixed(1)}
                                                </Text>
                                                <Text style={[styles.scoreLabel, { color: theme.colors.onSurfaceVariant }]}>Rating</Text>
                                            </View>
                                        )}
                                    </View>
                                )}

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
        height: 200,
    },
    overlay: {
        flex: 1,
        justifyContent: "space-between",
        padding: 16,
        backgroundColor: "rgba(0,0,0,0.35)",
    },
    title: {
        fontSize: 18,
        fontWeight: "600",
        color: "#fff",
        lineHeight: 24,
    },
    actionRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end",
    },
    actionButton: {
        margin: 0,
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
    scoreRow: {
        flexDirection: "row",
        gap: 16,
        paddingBottom: 14,
        borderBottomWidth: 1,
        borderBottomColor: "transparent",
    },
    scoreBadge: {
        alignItems: "center",
        borderWidth: 1.5,
        borderColor: "#e0e0e0",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 10,
        minWidth: 90,
    },
    scoreValue: {
        fontSize: 24,
        fontWeight: "700",
    },
    scoreValueAlt: {
        fontSize: 24,
        fontWeight: "700",
        color: "#1e3a5f",
    },
    scoreLabel: {
        fontSize: 11,
        marginTop: 2,
        textTransform: "uppercase",
        letterSpacing: 0.5,
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