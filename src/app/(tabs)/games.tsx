import { View, StyleSheet, FlatList, ScrollView } from "react-native";
import { useNavigation, useFocusEffect } from "expo-router";
import * as SecureStore from "@/utils/SecureStore";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState, useEffect, useRef, useCallback } from "react";
import {
      Text,
      Searchbar,
      SegmentedButtons,
      useTheme,
      ActivityIndicator,
      Chip,
      Button,
      Icon,
      TextInput,
} from "react-native-paper";
import GameCard from "components/GameCard";
import ErrorSnackBar from "components/ErrorSnackBar";

interface FilterOption {
      id: number;
      name: string;
}

interface Filters {
      genres: FilterOption[];
      tags: FilterOption[];
}

const METACRITIC_OPTIONS = [
      { label: "Any", value: "" },
      { label: "90+", value: "90,100" },
      { label: "80+", value: "80,100" },
      { label: "70+", value: "70,100" },
      { label: "60+", value: "60,100" },
];

const ORDERING_OPTIONS = [
      { label: "Relevance", value: "" },
      { label: "Name", value: "name" },
      { label: "Released", value: "-released" },
      { label: "Added", value: "-added" },
      { label: "Rating", value: "-rating" },
      { label: "Metacritic", value: "-metacritic" },
];

export default function Tab() {
      const [searchQuery, setSearchQuery] = useState("");
      const [filter, setFilter] = useState<string>("browse");
      const [results, setResults] = useState({ results: [] });
      const [isLoading, setIsLoading] = useState(false);
      const [error, setError] = useState<string | null>(null);
      const [allFavourites, setAllFavourites] = useState([]);
      const [showFilters, setShowFilters] = useState(false);
const [filters, setFilters] = useState<Filters>({ genres: [], tags: [] });
       const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
       const [selectedTags, setSelectedTags] = useState<number[]>([]);
       const [selectedMetacritic, setSelectedMetacritic] = useState("");
       const [selectedOrdering, setSelectedOrdering] = useState("");
       const [genreSearch, setGenreSearch] = useState("");
       const [tagSearch, setTagSearch] = useState("");
       const [favGenreSearch, setFavGenreSearch] = useState("");
       const [favTagSearch, setFavTagSearch] = useState("");
       const [selectedFavGenres, setSelectedFavGenres] = useState<number[]>([]);
       const [selectedFavTags, setSelectedFavTags] = useState<number[]>([]);
      const theme = useTheme();
      const insets = useSafeAreaInsets();
      const navigation = useNavigation();

      useEffect(() => {
            navigation.setOptions({ headerShown: false });
      }, [navigation]);

      useEffect(() => {
            async function loadFilters() {
                  try {
                        const response = await fetch(
                              `${process.env.EXPO_PUBLIC_API_URL}/filters`,
                        );
                        const data = await response.json();
                        if (!data.error) {
                              setFilters(data);
                        }
                  } catch (e) {
                        console.error("Failed to load filters:", e);
                  }
            }
            loadFilters();
      }, []);

      async function fetchGames() {
            if (searchQuery.trim() === "" && selectedGenres.length === 0 && selectedTags.length === 0) {
                  setResults({ results: [] });
                  return;
            }

            setIsLoading(true);
            try {
                  const body: { search: string; genres?: string; tags?: string; metacritic?: string; ordering?: string } = {
                        search: searchQuery,
                  };

                  if (selectedGenres.length > 0) {
                        body.genres = selectedGenres.join(",");
                  }
                  if (selectedTags.length > 0) {
                        body.tags = selectedTags.join(",");
                  }
                  if (selectedMetacritic) {
                        body.metacritic = selectedMetacritic;
                  }
                  if (selectedOrdering) {
                        body.ordering = selectedOrdering;
                  }

                  const response = await fetch(
                        process.env.EXPO_PUBLIC_API_URL + "/search",
                        {
                              method: "POST",
                              headers: {
                                    Accept: "application/json",
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${await SecureStore.getItemAsync("token")}`,
                              },
                              body: JSON.stringify(body),
                        },
                  );
                  const data = await response.json();
                  if (data["error"] != null) {
                        setError(data["error"]);
                        setResults({ results: [] });
                  } else {
                        setResults(data);
                  }
            } catch (error) {
                  const errorMessage =
                        error instanceof Error
                              ? error.message
                              : "An error occurred while fetching games";
                  setError(errorMessage);
                  console.error(errorMessage);
                  setResults({ results: [] });
            } finally {
                  setIsLoading(false);
            }
      }

      const clearFilters = () => {
            setSelectedGenres([]);
            setSelectedTags([]);
            setSelectedMetacritic("");
            setSelectedOrdering("");
            setGenreSearch("");
            setTagSearch("");
            setFavGenreSearch("");
            setFavTagSearch("");
            setSelectedFavGenres([]);
            setSelectedFavTags([]);
      };

const hasActiveFilters = selectedGenres.length > 0 || selectedTags.length > 0 || selectedMetacritic !== "" || selectedOrdering !== "";

       const filteredGenres = filters.genres.filter((g) =>
             g.name.toLowerCase().includes(genreSearch.toLowerCase())
       );
       const filteredTags = filters.tags.filter((t) =>
             t.name.toLowerCase().includes(tagSearch.toLowerCase())
       );

       const filteredFavGenres = filters.genres.filter((g) =>
             g.name.toLowerCase().includes(favGenreSearch.toLowerCase())
       );
       const filteredFavTags = filters.tags.filter((t) =>
             t.name.toLowerCase().includes(favTagSearch.toLowerCase())
       );

       const toggleGenre = (id: number) => {
            setSelectedGenres((prev) =>
                  prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id],
            );
      };

      const toggleTag = (id: number) => {
            setSelectedTags((prev) =>
                  prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
            );
      };

      const toggleFavGenre = (id: number) => {
            setSelectedFavGenres((prev) =>
                  prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id],
            );
      };

      const toggleFavTag = (id: number) => {
            setSelectedFavTags((prev) =>
                  prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
            );
      };

      async function fetchAllFavourites() {
            setIsLoading(true);
            try {
                  const response = await fetch(
                        process.env.EXPO_PUBLIC_API_URL + "/getUserFavourites",
                        {
                              method: "POST",
                              headers: {
                                    Accept: "application/json",
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${await SecureStore.getItemAsync("token")}`,
                              },
                              body: JSON.stringify({ search: "" }),
                        },
                  );
                  const data = await response.json();
                  if (data["error"] != null) {
                        setError(data["error"]);
                        setAllFavourites([]);
                        setResults({ results: [] });
                  } else {
                        setAllFavourites(data);
                  }
            } catch (error) {
                  const errorMessage =
                        error instanceof Error
                              ? error.message
                              : "An error occurred while fetching favourite games";
                  setError(errorMessage);
                  console.error(errorMessage);
                  setAllFavourites([]);
                  setResults({ results: [] });
            } finally {
                  setIsLoading(false);
            }
      }

      const filterFavourites = (query: string) => {
            if (!allFavourites || allFavourites.length === 0) {
                  return [];
            }
            let filtered = allFavourites;
            
            if (query.trim()) {
                  const lowerQuery = query.toLowerCase();
                  filtered = filtered.filter(
                        (game) =>
                              game.name &&
                              game.name.toLowerCase().includes(lowerQuery),
                  );
            }
            
            if (selectedFavGenres.length > 0) {
                  filtered = filtered.filter((game) => {
                        const gameGenres = (game.genres || []).map((g: any) => g.id || g);
                        return selectedFavGenres.some((id) => gameGenres.includes(id));
                  });
            }
            
            if (selectedFavTags.length > 0) {
                  filtered = filtered.filter((game) => {
                        const gameTags = (game.tags || []).map((t: any) => t.id || t);
                        return selectedFavTags.some((id) => gameTags.includes(id));
                  });
            }
            
            return filtered;
      };

      const handleFavorite = useCallback(
            (game: any, newFavorited: boolean) => {
                  setAllFavourites((prev) => {
                        const existingIndex = prev.findIndex(
                              (g) => g.id === game.id,
                        );
                        if (newFavorited) {
                              if (existingIndex === -1) {
                                    return [
                                          ...prev,
                                          { ...game, favorited: true },
                                    ];
                              } else {
                                    const updated = [...prev];
                                    updated[existingIndex] = {
                                          ...updated[existingIndex],
                                          favorited: true,
                                    };
                                    return updated;
                              }
                        } else {
                              if (existingIndex !== -1) {
                                    return prev.filter((g) => g.id !== game.id);
                              } else {
                                    return prev;
                              }
                        }
                  });

                  if (filter === "browse") {
                        setResults((prev) => ({
                              ...prev,
                              results: prev.results.map((g) =>
                                    g.id === game.id
                                          ? { ...g, favorited: newFavorited }
                                          : g,
                              ),
                        }));
                  }
            },
            [filter],
      );

      const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

      useEffect(() => {
            if (filter !== "favourite") {
                  if (timer.current) {
                        clearTimeout(timer.current);
                  }

                  if (searchQuery.trim() === "" && selectedGenres.length === 0 && selectedTags.length === 0) {
                        setResults({ results: [] });
                        setIsLoading(false);
                        return;
                  }

                  setIsLoading(true);

                  timer.current = setTimeout(() => {
                        fetchGames();
                  }, 500);

                  return () => {
                        if (timer.current) {
                              clearTimeout(timer.current);
                        }
                  };
            }
      }, [searchQuery, filter, selectedGenres, selectedTags, selectedMetacritic, selectedOrdering]);

      useEffect(() => {
            if (filter === "favourite") {
                  fetchAllFavourites();
            }
      }, [filter]);

      useEffect(() => {
            if (filter === "favourite") {
                  const filtered = filterFavourites(searchQuery);
                  setResults({ results: filtered });
            }
      }, [filter, searchQuery, allFavourites, selectedFavGenres, selectedFavTags]);

      return (
            <>
                  <ErrorSnackBar
                        message={error || ""}
                        type={error ? "error" : "info"}
                        onDismiss={() => setError(null)}
                  />
                  <View
                        style={[
                              styles.container,
                              {
                                    backgroundColor: theme.colors.background,
                                    paddingTop: insets.top,
                              },
                        ]}
                  >
                        <Text
                              variant="headlineLarge"
                              style={[
                                    styles.title,
                                    { color: theme.colors.onBackground },
                              ]}
                        >
                              Games
                        </Text>
                        <Searchbar
                              placeholder="Search for a game"
                              onChangeText={setSearchQuery}
                              value={searchQuery}
                        />
                        <View style={styles.filterRow}>
                              <SegmentedButtons
                                    value={filter}
                                    onValueChange={(value) => {
                                          setResults({ results: [] });
                                          setFilter(value);
                                    }}
                                    style={styles.segmentedButtons}
                                    buttons={[
                                          {
                                                value: "browse",
                                                label: "Browse",
                                                icon: "magnify",
                                          },
                                          {
                                                value: "favourite",
                                                label: "Favourite",
                                                icon: "heart",
                                          },
                                    ]}
                              />
                              <Button
                                    mode={showFilters ? "contained" : "outlined"}
                                    onPress={() => setShowFilters(!showFilters)}
                                    style={styles.filterToggle}
                                    icon={showFilters ? "chevron-up" : "filter-variant"}
                              >
                                    Filters
                              </Button>
                        </View>

                        {showFilters && filter === "browse" && (
                              <View style={styles.filtersContainer}>
                                    <View style={styles.filterSection}>
                                          <View style={styles.filterHeader}>
                                                <Text variant="labelLarge">Ordering</Text>
                                          </View>
                                          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                                <SegmentedButtons
                                                      value={selectedOrdering}
                                                      onValueChange={setSelectedOrdering}
                                                      buttons={ORDERING_OPTIONS}
                                                      style={styles.smallButtons}
                                                />
                                          </ScrollView>
                                    </View>

                                    <View style={styles.filterSection}>
                                          <View style={styles.filterHeader}>
                                                <Text variant="labelLarge">Metacritic Score</Text>
                                          </View>
                                          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                                <SegmentedButtons
                                                      value={selectedMetacritic}
                                                      onValueChange={setSelectedMetacritic}
                                                      buttons={METACRITIC_OPTIONS}
                                                      style={styles.smallButtons}
                                                />
                                          </ScrollView>
                                    </View>

                                    <View style={styles.filterSection}>
                                          <View style={styles.filterHeader}>
                                                <Text variant="labelLarge">Genres</Text>
                                          </View>
                                          <TextInput
                                                mode="outlined"
                                                placeholder="Search genres..."
                                                value={genreSearch}
                                                onChangeText={setGenreSearch}
                                                dense
                                                right={genreSearch ? <TextInput.Icon icon="close" onPress={() => setGenreSearch("")} /> : null}
                                          />
                                          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                                <View style={styles.chipRow}>
                                                      {filteredGenres.map((genre) => (
                                                            <Chip
                                                                  key={genre.id}
                                                                  selected={selectedGenres.includes(genre.id)}
                                                                  onPress={() => toggleGenre(genre.id)}
                                                                  style={styles.filterChip}
                                                                  showSelectedCheck
                                                            >
                                                                  {genre.name}
                                                            </Chip>
                                                      ))}
                                                </View>
                                          </ScrollView>
                                    </View>

                                    <View style={styles.filterSection}>
                                          <View style={styles.filterHeader}>
                                                <Text variant="labelLarge">Tags</Text>
                                          </View>
                                          <TextInput
                                                mode="outlined"
                                                placeholder="Search tags..."
                                                value={tagSearch}
                                                onChangeText={setTagSearch}
                                                dense
                                                right={tagSearch ? <TextInput.Icon icon="close" onPress={() => setTagSearch("")} /> : null}
                                          />
                                          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                                <View style={styles.chipRow}>
                                                      {filteredTags.map((tag) => (
                                                            <Chip
                                                                  key={tag.id}
                                                                  selected={selectedTags.includes(tag.id)}
                                                                  onPress={() => toggleTag(tag.id)}
                                                                  style={styles.filterChip}
                                                                  showSelectedCheck
                                                            >
                                                                  {tag.name}
                                                            </Chip>
                                                      ))}
                                                </View>
                                          </ScrollView>
                                    </View>

                                    {hasActiveFilters && (
                                          <Button
                                                mode="text"
                                                onPress={clearFilters}
                                                icon="close"
                                          >
                                                Clear Filters
                                          </Button>
                                    )}
                              </View>
                        )}

                        {showFilters && filter === "favourite" && (
                              <View style={styles.filtersContainer}>
                                    <View style={styles.filterSection}>
                                          <View style={styles.filterHeader}>
                                                <Text variant="labelLarge">Genres</Text>
                                          </View>
                                          <TextInput
                                                mode="outlined"
                                                placeholder="Search genres..."
                                                value={favGenreSearch}
                                                onChangeText={setFavGenreSearch}
                                                dense
                                                right={favGenreSearch ? <TextInput.Icon icon="close" onPress={() => setFavGenreSearch("")} /> : null}
                                          />
                                          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                                <View style={styles.chipRow}>
                                                      {filteredFavGenres.map((genre) => (
                                                            <Chip
                                                                  key={genre.id}
                                                                  selected={selectedFavGenres.includes(genre.id)}
                                                                  onPress={() => toggleFavGenre(genre.id)}
                                                                  style={styles.filterChip}
                                                                  showSelectedCheck
                                                            >
                                                                  {genre.name}
                                                            </Chip>
                                                      ))}
                                                </View>
                                          </ScrollView>
                                    </View>

                                    <View style={styles.filterSection}>
                                          <View style={styles.filterHeader}>
                                                <Text variant="labelLarge">Tags</Text>
                                          </View>
                                          <TextInput
                                                mode="outlined"
                                                placeholder="Search tags..."
                                                value={favTagSearch}
                                                onChangeText={setFavTagSearch}
                                                dense
                                                right={favTagSearch ? <TextInput.Icon icon="close" onPress={() => setFavTagSearch("")} /> : null}
                                          />
                                          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                                <View style={styles.chipRow}>
                                                      {filteredFavTags.map((tag) => (
                                                            <Chip
                                                                  key={tag.id}
                                                                  selected={selectedFavTags.includes(tag.id)}
                                                                  onPress={() => toggleFavTag(tag.id)}
                                                                  style={styles.filterChip}
                                                                  showSelectedCheck
                                                            >
                                                                  {tag.name}
                                                            </Chip>
                                                      ))}
                                                </View>
                                          </ScrollView>
                                    </View>

                                    {(selectedFavGenres.length > 0 || selectedFavTags.length > 0) && (
                                          <Button
                                                mode="text"
                                                onPress={() => {
                                                      setSelectedFavGenres([]);
                                                      setSelectedFavTags([]);
                                                      setFavGenreSearch("");
                                                      setFavTagSearch("");
                                                }}
                                                icon="close"
                                          >
                                                Clear Filters
                                          </Button>
                                    )}
                              </View>
                        )}

                        {isLoading ? (
                              <View style={styles.loadingContainer}>
                                    <ActivityIndicator size="large" />
                              </View>
                        ) : (
                              <FlatList
                                    data={results.results}
                                    renderItem={({ item }) => (
                                          <GameCard
                                                game={item}
                                                key={item.id}
                                                onFavorite={handleFavorite}
                                          />
                                    )}
                                    keyExtractor={(item) => item.id.toString()}
                                    ListEmptyComponent={() => {
                                          let message;
                                          if (filter === "favourite") {
                                                message =
                                                      searchQuery.trim() === ""
                                                            ? "No favourites found"
                                                            : "No matching favourites found";
                                          } else if (searchQuery.trim() === "" && !hasActiveFilters) {
                                                message = "Try searching for a game";
                                          } else {
                                                message = "No games found";
                                          }
                                          return (
                                                <View style={styles.centered}>
                                                      <Text>{message}</Text>
                                                </View>
                                          );
                                    }}
                              />
                        )}
                  </View>
            </>
      );
}

const styles = StyleSheet.create({
       container: {
             flex: 1,
             padding: 16,
       },
       title: {
             fontWeight: "bold",
             marginBottom: 16,
       },
       centered: {
             flex: 1,
             justifyContent: "center",
             alignItems: "center",
             padding: 20,
       },
       loadingContainer: {
             flex: 1,
             justifyContent: "center",
             alignItems: "center",
       },
       filterRow: {
             flexDirection: "row",
             alignItems: "center",
             gap: 8,
             marginVertical: 8,
       },
       segmentedButtons: {
             flex: 1,
       },
       filterToggle: {
             height: 40,
       },
       filtersContainer: {
             backgroundColor: "transparent",
             marginBottom: 8,
             gap: 12,
       },
filterSection: {
              gap: 4,
        },
       filterHeader: {
             flexDirection: "row",
             alignItems: "center",
             justifyContent: "space-between",
       },
       smallButtons: {
             flexWrap: "nowrap",
       },
       chipRow: {
             flexDirection: "row",
             gap: 8,
             paddingRight: 16,
       },
       filterChip: {
             marginBottom: 0,
       },
});
