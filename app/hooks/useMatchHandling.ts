"use client";

import { useState, useCallback, useEffect } from "react";
import { supabase, User, Match } from "../live/lib/supabase";
import { Dayjs } from "dayjs";

interface UseMatchHandlingProps {
  user: User | null;
}

export function useMatchHandling({ user }: UseMatchHandlingProps) {
  const [matchedUser, setMatchedUser] = useState<User | null>(null);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [matchedHours, setMatchedHours] = useState<number[]>([]);

  // get all matched hours for this user
  const fetchMatchedHours = useCallback(async () => {
    if (!user) return;

    try {
      const { data: matches, error } = await supabase
        .from("matches")
        .select("agreed_time")
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

      if (error) {
        console.error("Error fetching matched hours:", error);
        return;
      }

      const hours = matches?.map((match) => match.agreed_time) || [];
      setMatchedHours(hours);
    } catch (err) {
      console.error("Error fetching matched hours:", err);
    }
  }, [user]);

  // check if an hour is already matched
  const isHourMatched = useCallback(
    (hour: number) => {
      return matchedHours.includes(hour);
    },
    [matchedHours]
  );

  // fetch matched hours when user changes
  useEffect(() => {
    fetchMatchedHours();
  }, [fetchMatchedHours]);

  // update matched hours when a new match is found
  const handleMatchFound = useCallback(
    async (match: Match) => {
      try {
        console.log("Processing match found:", match);

        // get the other user's info
        const otherUserId =
          match.user1_id === user?.id ? match.user2_id : match.user1_id;
        console.log("Looking for other user:", otherUserId);

        const { data: otherUsers, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", otherUserId);

        if (error) {
          console.error("Error fetching matched user:", error);
          return;
        }

        if (!otherUsers || otherUsers.length === 0) {
          console.error("Other user not found:", otherUserId);
          return;
        }

        const otherUser = otherUsers[0];
        console.log("Found matched user:", otherUser);

        setMatchedUser(otherUser);
        setSuccess(
          `You matched with ${otherUser.name}! Both of you selected ${match.agreed_time}:00. Great choice!`
        );

        console.log("Match notification set for user:", user?.name || user?.id);

        // refresh matched hours
        fetchMatchedHours();

        // clear any existing errors
        setError("");
      } catch (err) {
        console.error("Error handling match:", err);
      }
    },
    [user?.id, user?.name, fetchMatchedHours]
  );

  const handleQRScanSuccess = async (
    qrData: string,
    selectedTime: Dayjs | null
  ) => {
    try {
      console.log("Scanned QR data:", qrData);

      // Parse QR data - should contain user ID and preferred time
      let data;
      try {
        data = JSON.parse(qrData);
      } catch (parseError) {
        console.error("Failed to parse QR data:", parseError);
        setError("Invalid QR code format");
        return;
      }

      const { userId: scannedUserId, time: scannedTime } = data;

      console.log("Parsed QR data:", { scannedUserId, scannedTime });

      if (!scannedUserId || scannedTime === undefined) {
        setError("QR code is missing required information");
        return;
      }

      if (!user || !selectedTime) {
        setError("Please select your preferred time first");
        return;
      }

      const selectedHour = selectedTime.hour();
      const selectedHour12 =
        selectedHour === 0
          ? 12
          : selectedHour > 12
          ? selectedHour - 12
          : selectedHour;

      // check if scanned user exists and same ang preferred time
      const { data: scannedUsers, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", scannedUserId);

      if (userError) {
        console.error("Error fetching scanned user:", userError);
        setError(`Error finding user: ${userError.message}`);
        return;
      }

      if (!scannedUsers || scannedUsers.length === 0) {
        setError("User not found - they may not be registered yet");
        return;
      }

      const scannedUser = scannedUsers[0];

      console.log("Current user:", { id: user.id, selectedHour12 });
      console.log("Scanned user:", {
        id: scannedUser.id,
        preferred_time: scannedUser.preferred_time,
      });

      // if scanning with self
      if (scannedUser.id === user.id) {
        setError("You can't match with yourself!");
        return;
      }

      if (scannedUser.preferred_time !== scannedTime) {
        setError("QR code is outdated or invalid");
        return;
      }

      if (selectedHour12 !== scannedTime) {
        setError(
          `Time mismatch! You selected ${selectedHour12}:00, they selected ${scannedTime}:00`
        );
        return;
      }

      // check if the two users already have a match (in both directions)
      const { data: existingMatches} = await supabase
        .from("matches")
        .select("*")
        .or(
          `and(user1_id.eq.${user.id},user2_id.eq.${scannedUserId}),and(user1_id.eq.${scannedUserId},user2_id.eq.${user.id})`
        );

      if (existingMatches && existingMatches.length > 0) {
        setError(`You can't match with the same person more than once!`);
        return;
      }

      // create a match
      const matchData = {
        user1_id: user.id,
        user2_id: scannedUserId,
        agreed_time: selectedHour12,
        created_at: new Date().toISOString(),
      };

      console.log("Attempting to create match:", matchData);

      const { error: matchError } = await supabase
        .from("matches")
        .insert(matchData);

      if (matchError) {
        console.error("Error creating match:", matchError);
        console.error("Match error details:", {
          message: matchError.message,
          details: matchError.details,
          hint: matchError.hint,
          code: matchError.code,
        });
        setError(`You can't match with the same person more than once!`);
        return;
      }

      console.log("Match created successfully! Broadcasting notification...");

      // Broadcast match notification immediately for real-time notification
      try {
        const notificationChannel = supabase.channel("match-notifications");
        await notificationChannel.send({
          type: "broadcast",
          event: "match-created",
          payload: {
            user1_id: user.id,
            user2_id: scannedUserId,
            agreed_time: selectedHour12,
            created_at: new Date().toISOString(),
            user1_name: user.name,
            user2_name: scannedUser.name,
          },
        });
        console.log("Broadcast sent successfully");
      } catch (broadcastError) {
        console.error("Failed to send broadcast:", broadcastError);
      }

      setSuccess(
        `You matched with ${scannedUser.name}! Both of you selected ${selectedHour12}:00. Great choice!`
      );
      setMatchedUser(scannedUser);

      // refresh matched hours immediately
      fetchMatchedHours();

      // clear any existing errors
      setError("");

      return true; // successful match creation
    } catch (err) {
      console.error("Error processing QR scan:", err);
      setError(
        `Error processing QR code: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
      return false;
    }
  };

  // listen for matches in real-time
  useEffect(() => {
    if (!user) return;

    console.log("Setting up real-time subscription for user:", user.id);

    // database changes subscription
    const dbChannel = supabase
      .channel(`matches-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "matches",
        },
        (payload) => {
          console.log("Real-time: New match detected:", payload);
          const match = payload.new as Match;

          // check if this match involves the current user
          if (match.user1_id === user.id || match.user2_id === user.id) {
            console.log("Match involves current user, processing...");
            handleMatchFound(match);
          } else {
            console.log("Match does not involve current user, ignoring...");
          }
        }
      )
      .subscribe((status) => {
        console.log("DB Subscription status:", status);
        if (status === "SUBSCRIBED") {
          console.log(
            "Successfully subscribed to DB updates for user:",
            user.id
          );
        } else if (status === "CHANNEL_ERROR") {
          console.error("Error subscribing to DB updates");
        }
      });

    // broadcast subscription for immediate notifications
    const broadcastChannel = supabase
      .channel("match-notifications")
      .on("broadcast", { event: "match-created" }, (payload) => {
        console.log("Broadcast: Match notification received:", payload);
        const match = payload.payload;

        // check if this match involves the current user
        if (match.user1_id === user.id || match.user2_id === user.id) {
          console.log("Broadcast match involves current user, processing...");
          handleMatchFound(match);
        } else {
          console.log(
            "Broadcast match does not involve current user, ignoring..."
          );
        }
      })
      .subscribe((status) => {
        console.log("Broadcast Subscription status:", status);
      });

    return () => {
      console.log("Cleaning up real-time subscriptions for user:", user.id);
      supabase.removeChannel(dbChannel);
      supabase.removeChannel(broadcastChannel);
    };
  }, [user, handleMatchFound]);

  return {
    matchedUser,
    error,
    success,
    setError,
    setSuccess,
    setMatchedUser,
    handleQRScanSuccess,
    matchedHours,
    isHourMatched,
    fetchMatchedHours,
  };
}
