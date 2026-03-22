import "next-auth";
import { User, Skill, UserSkill, Match, Message, SwapSession } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

export type UserWithSkills = User & {
  skills: (UserSkill & { skill: Skill })[];
};

export type MatchWithUsers = Match & {
  sender: UserWithSkills;
  receiver: UserWithSkills;
  messages?: Message[];
};

export type MessageWithSender = Message & {
  sender: Pick<User, "id" | "name" | "image">;
};

export type SwapSessionWithUsers = SwapSession & {
  proposer: Pick<User, "id" | "name" | "image">;
  receiver: Pick<User, "id" | "name" | "image">;
  match: Match;
};

export type PublicUser = Pick<User, "id" | "name" | "email" | "image" | "bio" | "location" | "createdAt"> & {
  skills: (UserSkill & { skill: Skill })[];
};
