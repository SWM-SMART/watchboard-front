'use client';
import ChannelService from '@/utils/ChannelService';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ChannelServiceWrapper() {
  const pathName = usePathname();
  const [channel, setChannel] = useState<ChannelService>();
  const key = process.env.NEXT_PUBLIC_CHANNEL_PLUGIN_KEY;
  useEffect(() => {
    if (key === undefined) return;
    const channel = new ChannelService();
    channel.loadScript();
    channel.boot({
      pluginKey: key,
    });
    setChannel(channel);
    return () => {
      setChannel(undefined);
      channel.shutdown();
    };
  }, [key]);

  useEffect(() => {
    if (channel === undefined) return;
    if (pathName === '/' || pathName === '/landing') channel.showChannelButton();
    return () => channel.hideChannelButton();
  });
  return <></>;
}
