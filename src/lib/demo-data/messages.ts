import type { Conversation, Message } from "@/types/domain";

export const conversationsByCreator: Record<string, Conversation[]> = {
  alexis: [
    {
      id: "conv-naanobot",
      collaborationId: null,
      participantName: "NaanoBot",
      participantAvatarUrl: "/images/logos/naano-mark.svg",
      isSystem: true,
      lastMessageAt: "2026-01-14T09:05:00.000Z",
    },
    {
      id: "conv-ferngrove",
      collaborationId: "collab-1",
      participantName: "Ferngrove",
      participantAvatarUrl: "/images/logos/ferngrove.svg",
      isSystem: false,
      lastMessageAt: "2026-09-10T14:20:00.000Z",
    },
    {
      id: "conv-bramble",
      collaborationId: "collab-2",
      participantName: "Bramble",
      participantAvatarUrl: "/images/logos/bramble.svg",
      isSystem: false,
      lastMessageAt: "2026-09-08T11:00:00.000Z",
    },
  ],
  marcus: [
    {
      id: "conv-naanobot-marcus",
      collaborationId: null,
      participantName: "NaanoBot",
      participantAvatarUrl: "/images/logos/naano-mark.svg",
      isSystem: true,
      lastMessageAt: "2026-04-02T09:05:00.000Z",
    },
  ],
  juliette: [
    {
      id: "conv-naanobot-juliette",
      collaborationId: null,
      participantName: "NaanoBot",
      participantAvatarUrl: "/images/logos/naano-mark.svg",
      isSystem: true,
      lastMessageAt: "2026-08-30T09:05:00.000Z",
    },
  ],
};

export const messagesByConversation: Record<string, Message[]> = {
  "conv-naanobot": [
    {
      id: "msg-1",
      conversationId: "conv-naanobot",
      senderName: "NaanoBot",
      senderIsSelf: false,
      body: "Welcome to Naano! Your card is live — share it on LinkedIn to start earning on every brand it brings in.",
      createdAt: "2026-01-14T09:05:00.000Z",
    },
  ],
  "conv-naanobot-marcus": [
    {
      id: "msg-2",
      conversationId: "conv-naanobot-marcus",
      senderName: "NaanoBot",
      senderIsSelf: false,
      body: "Welcome to Naano! A question or need help? Start here.",
      createdAt: "2026-04-02T09:05:00.000Z",
    },
  ],
  "conv-naanobot-juliette": [
    {
      id: "msg-3",
      conversationId: "conv-naanobot-juliette",
      senderName: "NaanoBot",
      senderIsSelf: false,
      body: "Welcome to Naano! A question or need help? Start here.",
      createdAt: "2026-08-30T09:05:00.000Z",
    },
  ],
  "conv-ferngrove": [
    {
      id: "msg-4",
      conversationId: "conv-ferngrove",
      senderName: "Ferngrove",
      senderIsSelf: false,
      body: "Loved your last post on cold outbound — brief for the Outbound Playbook campaign is attached to the booking.",
      createdAt: "2026-09-09T10:00:00.000Z",
    },
    {
      id: "msg-5",
      conversationId: "conv-ferngrove",
      senderName: "Alexis Jarre",
      senderIsSelf: true,
      body: "Just read it through — planning to publish Wednesday, will send a draft first.",
      createdAt: "2026-09-10T14:20:00.000Z",
    },
  ],
  "conv-bramble": [
    {
      id: "msg-6",
      conversationId: "conv-bramble",
      senderName: "Bramble",
      senderIsSelf: false,
      body: "Can you confirm a post date for Design Week? We'd love it in the first week.",
      createdAt: "2026-09-08T11:00:00.000Z",
    },
  ],
};
