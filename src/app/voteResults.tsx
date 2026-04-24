import { useEffect, useState, useCallback, useRef } from "react";
import { ActivityIndicator, StyleSheet, BackHandler } from "react-native";
import { View, FlatList } from "react-native";
import { useRouter, useNavigation, useFocusEffect } from "expo-router";
import { Text, useTheme, Button } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as SecureStore from "@/utils/SecureStore";
import GameItem from "../../components/GameItem";

interface Game {
      name: string;
      background_image: string | null;
      votes: number;
      upvotes: number;
      downvotes: number;
}

interface PlayerVotes {
      [playerId: string]: {
            [gameId: string]: number;
      };
}

interface PlayersFavoriteGames {
      [playerId: string]: string[];
}

interface GameResultsResponse {
      success: boolean;
      voting_finished?: boolean;
      lobby_id?: string;
      games?: { [id: string]: Game };
      players_favorite_games?: PlayersFavoriteGames;
      total_votes_cast?: number;
      total_players?: number;
      player_votes?: PlayerVotes;
      remaining_count?: number;
      remaining_names?: string[];
}

interface GameItem {
      id: string;
      background_image: string | null;
      name: string;
      votes: number;
}

export default function VoteResults() {
      const router = useRouter();
      const theme = useTheme();
      const insets = useSafeAreaInsets();
      const navigation = useNavigation();
      const [games, setGames] = useState<GameItem[] | undefined>(undefined);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState<string | null>(null);
      const [remainingCount, setRemainingCount] = useState<number | undefined>(undefined);
      const [remainingNames, setRemainingNames] = useState<string[] | undefined>(undefined);
      const [totalPlayersCount, setTotalPlayersCount] = useState<number | undefined>(undefined);
      const isNavigatingAway = useRef(false);

      const leaveVoting = async () => {
            try {
                  setLoading(true);
                  const response = await fetch(
                        `${process.env.EXPO_PUBLIC_API_URL}/leaveLobby`,
                        {
                              method: "GET",
                              headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${await SecureStore.getItemAsync("token")}`,
                              },
                        },
                  );
                  const data = await response.json();
                  if (data["error"]) {
                        setError(data["error"]);
                  } else {
                        setLoading(false);
                        router.replace("/");
                  }
            } catch (error) {
                  console.error(error);
            }
      };

      const startNewVote = async () => {
            try {
                  isNavigatingAway.current = true;
                  setLoading(true);
                  const response = await fetch(
                        `${process.env.EXPO_PUBLIC_API_URL}/resetVoting`,
                        {
                              method: "POST",
                              headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${await SecureStore.getItemAsync("token")}`,
                              },
                        },
                  );
                  const data = await response.json();
                  if (data.error) {
                        setError(data.error);
                        setLoading(false);
                        isNavigatingAway.current = false;
                  } else {
                        setLoading(false);
                        router.replace("/lobby");
                  }
            } catch (error) {
                  console.error(error);
                  setLoading(false);
                  isNavigatingAway.current = false;
            }
      };

      const getGameResults = async (showLoading = false) => {
            try {
                  if (showLoading) {
                        setLoading(true);
                  }
                  const response = await fetch(
                        `${process.env.EXPO_PUBLIC_API_URL}/voteResult`,
                        {
                              method: "GET",
                              headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${await SecureStore.getItemAsync("token")}`,
                              },
                        },
                  );
                  const data: GameResultsResponse & { error?: string } =
                        await response.json();
                  if (data.error) {
                        if (showLoading) {
                              setError(data.error);
                              setLoading(false);
                        } else {
                              if (data.error !== "You are not in any lobby" && data.error !== "Voting has not started yet") {
                                    console.error(data.error);
                              }
                        }
                  } else if (data.voting_finished === false) {
                        setGames(undefined);
                        setRemainingCount(data.remaining_count);
                        setRemainingNames(data.remaining_names);
                        setTotalPlayersCount(data.total_players);
                        if (showLoading) {
                              setLoading(false);
                        }
                  } else if (data.games) {
                        const gameItems: GameItem[] = Object.entries(data.games)
                              .map(([id, game]) => ({
                                    id,
                                    game_id: parseInt(id),
                                    name: game.name,
                                    votes: game.votes,
                                    background_image: game.background_image,
                              }))
                              .sort((a, b) => b.votes - a.votes);
                        setGames(gameItems);
                        if (showLoading) {
                              setLoading(false);
                        }
                  }
            } catch (error) {
                  if (showLoading) {
                        setError(
                              error instanceof Error
                                    ? error.message
                                    : "An error occurred",
                        );
                        setLoading(false);
                  } else {
                        console.error(error);
                  }
            }
      };

      useEffect(() => {
            navigation.setOptions({ headerShown: false, gestureEnabled: false });
      }, [navigation]);

      useFocusEffect(
            useCallback(() => {
                  const onBackPress = () => true;
                  const backHandler = BackHandler.addEventListener("hardwareBackPress", onBackPress);

                  getGameResults(true);
                  const interval = setInterval(() => {
                        if (!isNavigatingAway.current) {
                              getGameResults(false);
                        }
                  }, 2000);
                  return () => {
                        clearInterval(interval);
                        backHandler.remove();
                  };
            }, []),
      );

      return (
            <View
                  style={{
                        flex: 1,
                        paddingTop: insets.top,
                        backgroundColor: theme.colors.background,
                  }}
            >
                  <View style={styles.header}>
                        <Text
                              variant="headlineLarge"
                              style={[
                                    styles.title,
                                    { color: theme.colors.onBackground },
                              ]}
                        >
                              Results
                        </Text>
                  </View>

                  {loading ? (
                        <View
                              style={{
                                    flex: 1,
                                    justifyContent: "center",
                                    alignItems: "center",
                              }}
                        >
                              <ActivityIndicator size="large" />
                        </View>
                  ) : error ? (
                        <View
                              style={{
                                    flex: 1,
                                    justifyContent: "center",
                                    alignItems: "center",
                              }}
                        >
                              <Text style={{ color: theme.colors.error }}>
                                    {error}
                              </Text>
                        </View>
                  ) : games === undefined ? (
                        <View
                              style={{
                                    flex: 1,
                                    justifyContent: "center",
                                    alignItems: "center",
                                    padding: 20
                              }}
                        >
                              <ActivityIndicator size="large" style={{ marginBottom: 20 }} color={theme.colors.primary} />
                              <Text variant="titleLarge" style={{ textAlign: "center", fontWeight: "bold", marginBottom: 8 }}>
                                    Waiting for everyone to vote...
                              </Text>
                              {remainingCount !== undefined && totalPlayersCount !== undefined && (
                                    <Text variant="bodyLarge" style={{ textAlign: "center", marginBottom: 16 }}>
                                          {totalPlayersCount - remainingCount} / {totalPlayersCount} players have voted
                                    </Text>
                              )}
                              {remainingNames && remainingNames.length > 0 && (
                                    <View style={{ alignItems: "center" }}>
                                          <Text variant="labelLarge" style={{ color: theme.colors.outline, marginBottom: 8 }}>
                                                STILL VOTING:
                                          </Text>
                                          <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 8 }}>
                                                {remainingNames.map((name, index) => (
                                                      <View
                                                            key={index}
                                                            style={{
                                                                  backgroundColor: theme.colors.surfaceVariant,
                                                                  paddingHorizontal: 12,
                                                                  paddingVertical: 6,
                                                                  borderRadius: 16
                                                            }}
                                                      >
                                                            <Text variant="labelMedium">{name}</Text>
                                                      </View>
                                                ))}
                                          </View>
                                    </View>
                              )}
                        </View>
                  ) : (
                        <FlatList
                              data={games}
                              renderItem={({ item }) => (
                                    <GameItem item={item} />
                              )}
                              keyExtractor={(item) => item.id}
                              style={{
                                    flex: 1,
                                    backgroundColor: theme.colors.background,
                              }}
                        />
                  )}

                  {games && games.length > 0 && (
                        <View style={styles.bottomButtons}>
                              <Button
                                    mode="contained"
                                    onPress={startNewVote}
                                    style={styles.bottomButton}
                                    labelStyle={styles.bottomButtonLabel}
                              >
                                    <Text>Start New Vote</Text>
                              </Button>
                              <Button
                                    mode="outlined"
                                    onPress={leaveVoting}
                                    style={styles.bottomButton}
                                    labelStyle={styles.bottomButtonLabel}
                              >
                                    <Text>Leave Lobby</Text>
                              </Button>
                        </View>
                  )}
            </View>
      );
}

const styles = StyleSheet.create({
      title: {
            fontWeight: "bold",
      },
      header: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 16,
            marginBottom: 16,
      },
      button: {
            height: 50,
            justifyContent: "center",
      },
      buttonLabel: {
            fontSize: 16,
      },
      bottomButtons: {
            flexDirection: "row",
            justifyContent: "space-between",
            paddingHorizontal: 16,
            paddingVertical: 16,
            gap: 12,
      },
      bottomButton: {
            flex: 1,
            height: 50,
            justifyContent: "center",
      },
      bottomButtonLabel: {
            fontSize: 16,
      },
});
