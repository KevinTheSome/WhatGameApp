import { View, StyleSheet, ImageBackground } from "react-native";
import { BlurView } from "expo-blur";
import { useEffect, useState } from "react";
import { Text, Card, IconButton, useTheme, Portal, Modal, Button, Chip, Divider } from "react-native-paper";
import { ScrollView } from "react-native";
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

export default function GameCard(props: any) {
      const theme = useTheme();
      const [game, setGame] = useState(props.game);
      const [favorites, setFavorites] = useState(props.game.favorited);
      const [isModalVisible, setIsModalVisible] = useState(false);
      const [gameDetails, setGameDetails] = useState<GameDetails | null>(null);
      const [loadingDetails, setLoadingDetails] = useState(false);

      useEffect(() => {
            setFavorites(props.game.favorited);
      }, [props.game.favorited]);

      async function handlefavorites() {
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
                        props.onFavorite(game, newFavorites);
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
                                    source={{ uri: game.background_image }}
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
                                                <View style={styles.topRow}>
                                                      <Text style={styles.title} numberOfLines={2}>
                                                            {game.name}
                                                      </Text>
                                                </View>
                                                <View style={styles.iconRow}>
                                                      <IconButton
                                                            icon="information"
                                                            iconColor="white"
                                                            size={24}
                                                            onPress={handleInfoPress}
                                                      />
                                                      <IconButton
                                                            icon={
                                                                  favorites
                                                                        ? "heart"
                                                                        : "heart-outline"
                                                            }
                                                            iconColor="red"
                                                            size={28}
                                                            onPress={handlefavorites}
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
                                          <View style={styles.modalHeader}>
                                                <Text style={styles.modalTitle}>{game.name}</Text>
                                          </View>
                                    )}

                                    {loadingDetails ? (
                                          <Text style={styles.modalText}>Loading...</Text>
                                    ) : (
                                          <>
                                                {(gameDetails?.metacritic || gameDetails?.rating) && (
                                                      <View style={styles.ratingRow}>
                                                            {gameDetails?.metacritic && (
                                                                  <View style={styles.scoreBadge}>
                                                                        <Text style={styles.scoreLabel}>Metacritic</Text>
                                                                        <Text style={styles.scoreValue}>{gameDetails.metacritic}</Text>
                                                                  </View>
                                                            )}
                                                            {gameDetails?.rating && (
                                                                  <View style={styles.scoreBadge}>
                                                                        <Text style={styles.scoreLabel}>RAWG Rating</Text>
                                                                        <Text style={styles.scoreValue}>{gameDetails.rating.toFixed(1)}</Text>
                                                                  </View>
                                                            )}
                                                      </View>
                                                )}

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
      overlay: {
            flex: 1,
            flexDirection: "column",
            justifyContent: "space-between",
            padding: 16,
      },
      topRow: {
            flex: 1,
            justifyContent: "flex-start",
      },
      iconRow: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-end",
      },
      blurView: {
            flex: 1,
      },
      title: {
            fontSize: 20,
            fontWeight: "bold",
            color: "white",
            textShadowColor: "black",
            textShadowOffset: { width: -1, height: 1 },
            textShadowRadius: 2,
            flex: 1,
      },
      modalContainer: {
            backgroundColor: "white",
            padding: 0,
            margin: 20,
            borderRadius: 8,
            maxHeight: "80%",
      },
      modalHeader: {
            padding: 16,
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
      ratingRow: {
            flexDirection: "row",
            gap: 12,
            padding: 16,
            paddingBottom: 8,
      },
      scoreBadge: {
            alignItems: "center",
            minWidth: 80,
      },
      scoreLabel: {
            fontSize: 10,
            color: "gray",
            marginBottom: 2,
      },
      scoreValue: {
            fontSize: 20,
            fontWeight: "bold",
            color: "#1e3a5f",
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