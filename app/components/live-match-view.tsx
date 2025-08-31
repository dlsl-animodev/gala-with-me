"use client";

import { useState, useEffect } from "react";
import { supabase, Match, User } from "../lib/supabase";

interface MatchWithUsers extends Match {
  user1: User;
  user2: User;
}

export default function LiveMatchView() {
  const [matches, setMatches] = useState<MatchWithUsers[]>([]);
  const [totalMatches, setTotalMatches] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [newMatchAnimation, setNewMatchAnimation] = useState<number | null>(null);

  // fetch all matches with user details
  const fetchMatches = async () => {
    try {
      const { data: matchesData, error: matchError } = await supabase
        .from('matches')
        .select('*')
        .order('created_at', { ascending: false });

      if (matchError) {
        console.error('Error fetching matches:', matchError);
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
          .from('users')
          .select('*')
          .eq('id', match.user1_id)
          .single();

        const { data: user2Data } = await supabase
          .from('users')
          .select('*')
          .eq('id', match.user2_id)
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
      console.error('Error in fetchMatches:', err);
      setLoading(false);
    }
  };

  // real-time subscription for match updates
  useEffect(() => {
    fetchMatches();

    // real-time subscription
    const channelName = `live-matches-${Date.now()}`;
    console.log('Setting up real-time channel:', channelName);
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches',
        },
        async (payload) => {
          console.log('Real-time update detected:', payload.eventType);
          
          if (payload.eventType === 'INSERT') {
            const newMatch = payload.new as Match;
            setNewMatchAnimation(newMatch.id);
            setTimeout(() => setNewMatchAnimation(null), 3000);
          }
          
          // force immediate refresh on real-time event
          await fetchMatches();
        }
      )
      .subscribe((status) => {
        console.log('Real-time status:', status);
      });

    return () => {
      console.log('Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, []);

  const formatTime = (hour: number) => {
    return `${hour}:00`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-200 via-orange-400 to-orange-600 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-white mb-4 mx-auto"></div>
          <h2 className="text-2xl font-bold text-white drop-shadow">Loading Live Matches...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-200 via-orange-400 to-orange-600 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-white mb-4 tracking-wide drop-shadow-lg">
            Gala With Me
          </h1>
          <p className="text-2xl text-orange-100 mb-6 drop-shadow">Live Match Results</p>
          <div className="bg-white/30 backdrop-blur-sm rounded-full px-8 py-4 inline-block shadow-lg">
            <span className="text-3xl font-bold text-white drop-shadow">
              {totalMatches} {totalMatches === 1 ? 'Match' : 'Matches'} Found!
            </span>
          </div>
          <p className="text-white/80 text-lg mt-4 drop-shadow">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>

        {/* Matches Display */}
        {matches.length > 0 ? (
          <div className="space-y-6">
            {matches.map((match, index) => (
              <div
                key={match.id}
                className={`bg-white/25 backdrop-blur-sm rounded-2xl p-6 border border-white/30 hover:bg-white/30 transition-all duration-300 transform hover:scale-[1.02] shadow-lg mx-auto max-w-4xl ${
                  newMatchAnimation === match.id 
                    ? 'animate-pulse ring-4 ring-yellow-400 ring-opacity-75 bg-yellow-200/30' 
                    : ''
                }`}
              >
                {/* Match Number */}
                <div className="text-center mb-6">
                  <span className="bg-white/40 text-orange-900 px-6 py-3 rounded-full text-xl font-bold shadow">
                    Match #{matches.length - index}
                  </span>
                </div>

                {/* Users - Horizontal Layout */}
                <div className="flex items-center justify-center gap-8 mb-6">
                  <div className="bg-white/30 rounded-lg p-4 shadow flex-1 max-w-xs text-center">
                    <p className="text-orange-900 font-semibold text-xl">{match.user1.name}</p>
                    <p className="text-orange-700 text-sm mt-1">{match.user1.department}</p>
                  </div>
                  
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white text-3xl font-bold">+</span>
                    </div>
                  </div>

                  <div className="bg-white/30 rounded-lg p-4 shadow flex-1 max-w-xs text-center">
                    <p className="text-orange-900 font-semibold text-xl">{match.user2.name}</p>
                    <p className="text-orange-700 text-sm mt-1">{match.user2.department}</p>
                  </div>
                </div>

                {/* Match Details */}
                <div className="text-center space-y-3">
                  <div className="inline-block px-6 py-3 rounded-full bg-white/40 text-orange-900 shadow">
                    <span className="font-bold text-xl">
                      {formatTime(match.agreed_time)}
                    </span>
                  </div>
                  <p className="text-orange-800 text-base">
                    Matched at {formatDate(match.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-12 max-w-2xl mx-auto shadow-xl">
              <h2 className="text-4xl font-bold text-white mb-4 drop-shadow">No Matches Yet</h2>
              <p className="text-xl text-orange-100 drop-shadow">
                Matches will appear here in real-time!
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-white/70 text-lg italic drop-shadow">
            Page updates automatically.
          </p>
        </div>
      </div>
    </div>
  );
}
