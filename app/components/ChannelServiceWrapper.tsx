'use client';
import { useUser } from '@/states/user';
import ChannelService from '@/utils/ChannelService';
import { useEffect } from 'react';

export default function ChannelServiceWrapper() {
  const key = process.env.NEXT_PUBLIC_CHANNEL_PLUGIN_KEY;
  const userData = useUser((state) => state.userData);
  useEffect(() => {
    if (key === undefined) return;
    const channel = new ChannelService();
    channel.loadScript();
    channel.boot({
      pluginKey: key,
    });
    return () => channel.shutdown();
  }, [key, userData]);
  return <></>;
}
