"use client";

import { useState, useEffect } from "react";
import { supabase, Match, User } from "../live/lib/supabase";

interface MatchWithUsers extends Match {
  user1: User;
  user2: User;
}

export default function LiveMatchView() {
  const [matches, setMatches] = useState<MatchWithUsers[]>([]);
  const [totalMatches, setTotalMatches] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [newMatchAnimation, setNewMatchAnimation] = useState<number | null>(
    null
  );

  // fetch all matches with user details
  const fetchMatches = async () => {
    try {
      const { data: matchesData, error: matchError } = await supabase
        .from("matches")
        .select("*")
        .order("created_at", { ascending: false });

      if (matchError) {
        console.error("Error fetching matches:", matchError);
        return;
      }

      if (!matchesData || matchesData.length === 0) {
        setMatches([]);
        setTotalMatches(0);
        setLastUpdated(new Date());
        setLoading(false);
        return;
      }

      // fetch user details for each match
      const matchesWithUsers: MatchWithUsers[] = [];

      for (const match of matchesData) {
        const { data: user1Data } = await supabase
          .from("users")
          .select("*")
          .eq("id", match.user1_id)
          .single();

        const { data: user2Data } = await supabase
          .from("users")
          .select("*")
          .eq("id", match.user2_id)
          .single();

        if (user1Data && user2Data) {
          matchesWithUsers.push({
            ...match,
            user1: user1Data,
            user2: user2Data,
          });
        }
      }

      setMatches(matchesWithUsers);
      setTotalMatches(matchesWithUsers.length);
      setLastUpdated(new Date());
      setLoading(false);
    } catch (err) {
      console.error("Error in fetchMatches:", err);
      setLoading(false);
    }
  };

  // real-time subscription for match updates
  useEffect(() => {
    fetchMatches();

    // real-time subscription
    const channelName = `live-matches-${Date.now()}`;
    console.log("Setting up real-time channel:", channelName);

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "matches",
        },
        async (payload) => {
          console.log("Real-time update detected:", payload.eventType);

          if (payload.eventType === "INSERT") {
            const newMatch = payload.new as Match;
            setNewMatchAnimation(newMatch.id);

            setTimeout(() => setNewMatchAnimation(null), 8000); // Extended animation time for TV
          }

          // force immediate refresh on real-time event
          await fetchMatches();
        }
      )
      .subscribe((status) => {
        console.log("Real-time status:", status);
      });

    return () => {
      console.log("Cleaning up real-time subscription");
      supabase.removeChannel(channel);
    };
  }, []);

  const formatTime = (hour: number) => {
    return `${hour}:00`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: "Asia/Manila",
    });
  };

  // Get random position for floating match cards with more spread
  const getRandomPosition = (index: number, totalCount: number) => {
    // Generate positions in a grid-like pattern but with random offsets
    const cols = Math.ceil(Math.sqrt(totalCount * 1.5));
    const rows = Math.ceil(totalCount / cols);

    const col = index % cols;
    const row = Math.floor(index / cols);

    // Base position with some randomness
    const baseLeft = (col / (cols - 1)) * 70 + Math.random() * 10;
    const baseTop = (row / (rows - 1)) * 70 + Math.random() * 10;

    return {
      top: `${Math.min(85, Math.max(5, baseTop))}%`,
      left: `${Math.min(85, Math.max(5, baseLeft))}%`,
    };
  };

  // Calculate card size based on number of matches
  const getCardScale = (matchCount: number) => {
    if (matchCount <= 5) return "scale-100"; // Large cards
    if (matchCount <= 10) return "scale-90"; // Medium-large cards
    if (matchCount <= 20) return "scale-75"; // Medium cards
    if (matchCount <= 40) return "scale-50"; // Small cards
    if (matchCount <= 80) return "scale-[0.35]"; // Tiny cards
    return "scale-[0.25]"; // Micro cards for 100+ matches
  };

  // Get font size classes based on match count
  const getFontSizeClass = (matchCount: number) => {
    if (matchCount <= 20) return "text-base";
    if (matchCount <= 40) return "text-sm";
    if (matchCount <= 80) return "text-xs";
    return "text-[10px]"; // Very small text for 100+ matches
  };

  // Get random rotation angle
  const getRandomRotation = (index: number) => {
    const rotations = [-8, -5, -3, -2, 2, 3, 5, 8];
    return rotations[index % rotations.length];
  };

  // Determine how many cards to display
  const getDisplayCount = (totalCount: number) => {
    if (totalCount <= 20) return totalCount;
    if (totalCount <= 50) return Math.min(30, totalCount);
    if (totalCount <= 100) return Math.min(40, totalCount);
    return 50; // Max 50 cards displayed for 100+ matches
  };

  const cardScale = getCardScale(totalMatches);
  const fontSizeClass = getFontSizeClass(totalMatches);
  const displayCount = getDisplayCount(totalMatches);

  if (loading) {
    return (
      <div className="h-screen bg-gradient-to-br from-white via-orange-50 to-orange-100 flex items-center justify-center overflow-hidden">
        <div className="text-center animate-fade-in">
          <div className="relative mb-8">
            <div className="animate-spin rounded-full h-32 w-32 border-8 border-orange-200 border-t-orange-500 mx-auto"></div>
            <div className="absolute inset-0 animate-ping rounded-full h-32 w-32 border-4 border-orange-300 mx-auto opacity-30"></div>
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent drop-shadow-sm animate-pulse">
            Loading Live Matches...
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-white via-orange-50 to-orange-100 overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float opacity-10"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${4 + Math.random() * 3}s`,
            }}
          >
            <div className="w-16 h-16 bg-gradient-to-br from-orange-300 to-amber-300 rounded-full"></div>
          </div>
        ))}
      </div>

      {/* Header - Fixed at top */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-orange-200 shadow-lg">
        <div className="px-12 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-6xl font-black bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent animate-pulse">
                🕺 Gala With Me 💃
              </h1>
              <p className="text-2xl text-orange-700 mt-2">
                Live Match Results
              </p>
            </div>

            <div className="text-right">
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-8 py-4 rounded-full shadow-xl animate-bounce">
                <span className="text-4xl font-black">
                  {totalMatches} {totalMatches === 1 ? "Match" : "Matches"} 🎉
                </span>
              </div>
              <p className="text-orange-600 text-lg mt-2">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="pt-40 pb-20 px-8 h-full relative">
        {matches.length > 0 ? (
          <div className="relative h-full">
            {matches.slice(0, displayCount).map((match, index) => {
              const position = getRandomPosition(index, displayCount);
              const rotation = getRandomRotation(index);
              const isNewMatch = newMatchAnimation === match.id;

              return (
                <div
                  key={match.id}
                  className={`absolute transform animate-slide-in-random ${cardScale} ${
                    isNewMatch
                      ? "animate-new-match z-40 !scale-125"
                      : "animate-float-gentle"
                  }`}
                  style={{
                    ...position,
                    transform: `${isNewMatch ? "" : `rotate(${rotation}deg)`}`,
                    animationDelay: `${index * 0.1}s`,
                    animationDuration: isNewMatch
                      ? "2s"
                      : `${6 + Math.random() * 4}s`,
                  }}
                >
                  <div
                    className={`bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border-2 border-orange-300 p-6 transform hover:scale-110 transition-all duration-500 ${
                      isNewMatch
                        ? "ring-8 ring-amber-400 ring-opacity-50 shadow-amber-400/50"
                        : "hover:shadow-orange-300/30"
                    } ${fontSizeClass}`}
                  >
                    {/* Match Badge */}
                    <div className="text-center mb-4">
                      <span className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-full font-bold shadow-lg animate-pulse">
                        Match #{matches.length - index}
                      </span>
                    </div>

                    {/* Users */}
                    <div className="space-y-3">
                      <div className="bg-gradient-to-r from-orange-100 to-amber-100 rounded-xl p-3 text-center border border-orange-200">
                        <p className="text-orange-900 font-bold">
                          {match.user1.name}
                        </p>
                      </div>

                      <div className="flex justify-center">
                        <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg animate-pulse"></div>
                      </div>

                      <div className="bg-gradient-to-r from-orange-100 to-amber-100 rounded-xl p-3 text-center border border-orange-200">
                        <p className="text-orange-900 font-bold">
                          {match.user2.name}
                        </p>
                      </div>
                    </div>

                    {/* Time */}
                    <div className="text-center mt-4">
                      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-full shadow-lg">
                        <span className="font-bold">
                          ⏰ {formatTime(match.agreed_time)}
                        </span>
                      </div>
                      <p className="text-orange-600 opacity-80 mt-2">
                        {formatDate(match.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Overflow indicator for hidden matches */}
            {matches.length > displayCount && (
              <div className="absolute bottom-8 right-8 bg-white/90 backdrop-blur-md rounded-full px-6 py-3 shadow-xl border-2 border-orange-300 animate-bounce z-50">
                <span className="text-orange-700 font-bold text-lg">
                  +{matches.length - displayCount} more matches! 🎊
                </span>
              </div>
            )}

            {/* Indicator for large number of matches */}
            {totalMatches > 50 && (
              <div className="absolute bottom-8 left-8 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-full px-6 py-3 shadow-xl animate-pulse z-50">
                <span className="font-bold text-lg">
                  🔥 Hot Night! {totalMatches} Matches! 🔥
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center animate-pulse">
              <div className="bg-white/90 backdrop-blur-md rounded-3xl p-16 shadow-2xl border-2 border-orange-300 max-w-2xl">
                <div className="text-8xl mb-6 animate-bounce">⏳</div>
                <h2 className="text-5xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-4">
                  No Matches Yet
                </h2>
                <p className="text-2xl text-orange-700">
                  Matches will appear here in real-time! 🎉
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer - Fixed at bottom */}
      <div className="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-orange-200 px-12 py-4">
        <div className="text-center">
          <p className="text-orange-700 text-xl font-semibold animate-pulse">
            🔄 Page updates automatically • Live TV Display
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
        }

        @keyframes float-gentle {
          0%,
          100% {
            transform: translateY(0px) translateX(0px);
          }
          25% {
            transform: translateY(-10px) translateX(5px);
          }
          50% {
            transform: translateY(-5px) translateX(-5px);
          }
          75% {
            transform: translateY(-15px) translateX(3px);
          }
        }

        @keyframes slide-in-random {
          0% {
            opacity: 0;
            transform: translateY(50px) scale(0.8);
          }
          100% {
            opacity: 1;
            transform: translateY(0px) scale(1);
          }
        }

        @keyframes new-match {
          0%,
          100% {
            transform: scale(1.25) rotate(0deg);
            filter: drop-shadow(0 0 30px rgba(251, 191, 36, 0.8));
          }
          25% {
            transform: scale(1.3) rotate(2deg);
            filter: drop-shadow(0 0 40px rgba(251, 191, 36, 1));
          }
          50% {
            transform: scale(1.35) rotate(-1deg);
            filter: drop-shadow(0 0 50px rgba(251, 191, 36, 1));
          }
          75% {
            transform: scale(1.3) rotate(1deg);
            filter: drop-shadow(0 0 35px rgba(251, 191, 36, 0.9));
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-float-gentle {
          animation: float-gentle 8s ease-in-out infinite;
        }

        .animate-slide-in-random {
          animation: slide-in-random 1s ease-out;
        }

        .animate-new-match {
          animation: new-match 2s ease-in-out infinite;
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }

        /* TV-safe zones and text scaling */
        @media screen and (min-width: 1920px) {
          .text-6xl {
            font-size: 4.5rem;
          }
          .text-5xl {
            font-size: 3.5rem;
          }
          .text-4xl {
            font-size: 2.5rem;
          }
        }
      `}</style>
    </div>
  );
}
