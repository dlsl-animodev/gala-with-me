"use client";

import { useState, useCallback, useEffect } from "react";
import { supabase, User, Match } from "../lib/supabase";
import { Dayjs } from "dayjs";

interface UseMatchHandlingProps {
  user: User | null;
}

export function useMatchHandling({ user }: UseMatchHandlingProps) {
  const [matchedUser, setMatchedUser] = useState<User | null>(null);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const handleMatchFound = useCallback(async (match: Match) => {
    try {
      console.log('Processing match found:', match);
      
      // get the other user's info
      const otherUserId = match.user1_id === user?.id ? match.user2_id : match.user1_id;
      console.log('Looking for other user:', otherUserId);
      
      const { data: otherUsers, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', otherUserId);

      if (error) {
        console.error('Error fetching matched user:', error);
        return;
      }

      if (!otherUsers || otherUsers.length === 0) {
        console.error('Other user not found:', otherUserId);
        return;
      }

      const otherUser = otherUsers[0];
      console.log('Found matched user:', otherUser);

      setMatchedUser(otherUser);
      setSuccess(`You matched with ${otherUser.name}! Both of you selected ${match.agreed_time}:00. Great choice!`);
      
      // Clear any existing errors
      setError('');
    } catch (err) {
      console.error('Error handling match:', err);
    }
  }, [user?.id]);

  const handleQRScanSuccess = async (qrData: string, selectedTime: Dayjs | null) => {
    try {
      console.log('Scanned QR data:', qrData);
      
      // Parse QR data - should contain user ID and preferred time
      let data;
      try {
        data = JSON.parse(qrData);
      } catch (parseError) {
        console.error('Failed to parse QR data:', parseError);
        setError('Invalid QR code format');
        return;
      }

      const { userId: scannedUserId, time: scannedTime } = data;
      
      console.log('Parsed QR data:', { scannedUserId, scannedTime });

      if (!scannedUserId || scannedTime === undefined) {
        setError('QR code is missing required information');
        return;
      }

      if (!user || !selectedTime) {
        setError('Please select your preferred time first');
        return;
      }

      const selectedHour = selectedTime.hour();
      const selectedHour12 = selectedHour === 0 ? 12 : selectedHour > 12 ? selectedHour - 12 : selectedHour;

      // check if scanned user exists and same ang preferred time
      const { data: scannedUsers, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', scannedUserId);

      if (userError) {
        console.error('Error fetching scanned user:', userError);
        setError(`Error finding user: ${userError.message}`);
        return;
      }

      if (!scannedUsers || scannedUsers.length === 0) {
        setError('User not found - they may not be registered yet');
        return;
      }

      const scannedUser = scannedUsers[0];

      console.log('Current user:', { id: user.id, selectedHour12 });
      console.log('Scanned user:', { id: scannedUser.id, preferred_time: scannedUser.preferred_time });

      // if scanning with self
      if (scannedUser.id === user.id) {
        setError("You can't match with yourself!");
        return;
      }

      if (scannedUser.preferred_time !== scannedTime) {
        setError('QR code is outdated or invalid');
        return;
      }

      if (selectedHour12 !== scannedTime) {
        setError(`Time mismatch! You selected ${selectedHour12}:00, they selected ${scannedTime}:00`);
        return;
      }

      // create a match
      const matchData = {
        user1_id: user.id,
        user2_id: scannedUserId,
        agreed_time: selectedHour12,
        created_at: new Date().toISOString(),
      };
      
      console.log('Attempting to create match:', matchData);
      
      const { error: matchError } = await supabase
        .from('matches')
        .insert(matchData);

      if (matchError) {
        console.error('Error creating match:', matchError);
        console.error('Match error details:', {
          message: matchError.message,
          details: matchError.details,
          hint: matchError.hint,
          code: matchError.code
        });
        setError(`Failed to create match: ${matchError.message || 'Unknown error'}`);
        return;
      }

      setSuccess(`🎉 You matched with ${scannedUser.name}! Both of you selected ${selectedHour12}:00. Great choice! 🎉`);
      setMatchedUser(scannedUser);
      
      // clear any existing errors
      setError('');
      
      return true; // successful match creation
    } catch (err) {
      console.error('Error processing QR scan:', err);
      setError(`Error processing QR code: ${err instanceof Error ? err.message : 'Unknown error'}`);
      return false;
    }
  };

  // listen for matches in real-time
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('matches')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'matches',
          filter: `user1_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('New match detected (as user1):', payload);
          handleMatchFound(payload.new as Match);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'matches',
          filter: `user2_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('New match detected (as user2):', payload);
          handleMatchFound(payload.new as Match);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
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
  };
}
