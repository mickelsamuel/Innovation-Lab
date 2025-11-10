'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Calendar } from 'lucide-react';
import { createMentorSession } from '@/lib/mentors';
import { getAuthToken } from '@/lib/api';

interface SessionBookingProps {
  mentorId: string;
  onSuccess?: () => void;
}

export function SessionBooking({ mentorId, onSuccess }: SessionBookingProps) {
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [capacity, setCapacity] = useState('10');
  const [meetingUrl, setMeetingUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!startDate || !startTime || !endTime) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const token = getAuthToken();
      if (!token) throw new Error('Not authenticated');

      const startsAt = new Date(`${startDate}T${startTime}`).toISOString();
      const endsAt = new Date(`${startDate}T${endTime}`).toISOString();

      await createMentorSession(
        mentorId,
        {
          title: title.trim() || undefined,
          startsAt,
          endsAt,
          capacity: parseInt(capacity) || 10,
          meetingUrl: meetingUrl.trim() || undefined,
        },
        token
      );

      toast({
        title: 'Success',
        description: 'Office hours session created successfully',
      });

      // Reset form
      setTitle('');
      setStartDate('');
      setStartTime('');
      setEndTime('');
      setCapacity('10');
      setMeetingUrl('');

      onSuccess?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create session',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-slate-900/50 border-cyan-500/20">
      <CardHeader>
        <CardTitle className="text-cyan-400 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Schedule Office Hours
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-slate-300">
              Session Title (Optional)
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., React Best Practices"
              className="mt-1.5 bg-slate-800/50 border-slate-700 text-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="date" className="text-slate-300">
                Date *
              </Label>
              <Input
                id="date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
                className="mt-1.5 bg-slate-800/50 border-slate-700 text-white"
              />
            </div>

            <div>
              <Label htmlFor="startTime" className="text-slate-300">
                Start Time *
              </Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="mt-1.5 bg-slate-800/50 border-slate-700 text-white"
              />
            </div>

            <div>
              <Label htmlFor="endTime" className="text-slate-300">
                End Time *
              </Label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className="mt-1.5 bg-slate-800/50 border-slate-700 text-white"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="capacity" className="text-slate-300">
              Maximum Participants
            </Label>
            <Input
              id="capacity"
              type="number"
              min="1"
              max="100"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              className="mt-1.5 bg-slate-800/50 border-slate-700 text-white"
            />
          </div>

          <div>
            <Label htmlFor="meetingUrl" className="text-slate-300">
              Meeting URL (Optional)
            </Label>
            <Input
              id="meetingUrl"
              type="url"
              value={meetingUrl}
              onChange={(e) => setMeetingUrl(e.target.value)}
              placeholder="https://zoom.us/j/123456789"
              className="mt-1.5 bg-slate-800/50 border-slate-700 text-white"
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-cyan-600 hover:bg-cyan-700"
          >
            {isLoading ? 'Creating...' : 'Create Session'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
