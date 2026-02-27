import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Article, CitizenPost, Comment, MediaItem, UserProfile, ArticleCategory, CitizenPostStatus, UserRegistryEntry, UserRole } from '../backend';
import type { Principal } from '@icp-sdk/core/principal';

// ── Articles ──────────────────────────────────────────────────────────────────

export function useGetArticles() {
  const { actor, isFetching } = useActor();
  return useQuery<Article[]>({
    queryKey: ['articles'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getArticles();
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
  });
}

export function useGetArticlesByCategory(category: ArticleCategory) {
  const { actor, isFetching } = useActor();
  return useQuery<Article[]>({
    queryKey: ['articles', 'category', category],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getArticlesByCategory(category);
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
  });
}

export function useGetBreakingNews() {
  const { actor, isFetching } = useActor();
  return useQuery<Article[]>({
    queryKey: ['articles', 'breaking'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getBreakingNews();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function useGetFeaturedArticles() {
  const { actor, isFetching } = useActor();
  return useQuery<Article[]>({
    queryKey: ['articles', 'featured'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFeaturedArticles();
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
  });
}

// ── Citizen Posts ─────────────────────────────────────────────────────────────

export function useGetCitizenPosts() {
  const { actor, isFetching } = useActor();
  return useQuery<CitizenPost[]>({
    queryKey: ['citizenPosts'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCitizenPosts();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useCreateCitizenPost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      title: string;
      body: string;
      category: ArticleCategory;
      authorName: string;
      imageUrl: string;
    }) => {
      if (!actor) throw new Error('Not connected');
      return actor.createCitizenPost(data.title, data.body, data.category, data.authorName, data.imageUrl);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['citizenPosts'] });
    },
  });
}

export function useUpdateCitizenPostStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ postId, status }: { postId: bigint; status: CitizenPostStatus }) => {
      if (!actor) throw new Error('Not connected');
      return actor.updateArticleStatus(postId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['citizenPosts'] });
    },
  });
}

// ── Comments ──────────────────────────────────────────────────────────────────

export function useGetCommentsByArticle(articleId: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery<Comment[]>({
    queryKey: ['comments', 'article', articleId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCommentsByArticle(articleId);
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function useAddComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      articleId: bigint | null;
      postId: bigint | null;
      authorName: string;
      body: string;
    }) => {
      if (!actor) throw new Error('Not connected');
      return actor.addComment(data.articleId, data.postId, data.authorName, data.body);
    },
    onSuccess: (_result, variables) => {
      if (variables.articleId !== null) {
        queryClient.invalidateQueries({ queryKey: ['comments', 'article', variables.articleId.toString()] });
      }
      if (variables.postId !== null) {
        queryClient.invalidateQueries({ queryKey: ['comments', 'post', variables.postId.toString()] });
      }
    },
  });
}

// ── Media Items ───────────────────────────────────────────────────────────────

export function useGetMediaItems() {
  const { actor, isFetching } = useActor();
  return useQuery<MediaItem[]>({
    queryKey: ['mediaItems'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMediaItems();
    },
    enabled: !!actor && !isFetching,
    staleTime: 120_000,
  });
}

// ── User Profile ──────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getCallerUserProfile();
      } catch {
        // Backend traps for unregistered users — treat as null profile
        return null;
      }
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Not connected');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// ── Admin ─────────────────────────────────────────────────────────────────────

export function useCreateArticle() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      title: string;
      titleHindi: string;
      body: string;
      bodyHindi: string;
      category: ArticleCategory;
      author: string;
      authorRole: string;
      imageUrl: string;
      isBreaking: boolean;
      isFeatured: boolean;
    }) => {
      if (!actor) throw new Error('Not connected');
      return actor.createArticle(
        data.title, data.titleHindi, data.body, data.bodyHindi,
        data.category, data.author, data.authorRole, data.imageUrl,
        data.isBreaking, data.isFeatured
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    },
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isAdminCaller();
      } catch {
        // Backend may trap for unauthenticated callers — treat as not admin
        return false;
      }
    },
    enabled: !!actor && !isFetching,
    // Always fetch fresh — never return a stale false from anonymous session
    staleTime: 0,
    refetchOnMount: 'always',
    retry: false,
  });
}

// ── Role System ───────────────────────────────────────────────────────────────

export function useMyProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const query = useQuery<UserRegistryEntry | null>({
    queryKey: ['myProfile'],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getMyProfile();
      } catch {
        // Backend may trap for unregistered callers — treat as null
        return null;
      }
    },
    enabled: !!actor && !actorFetching,
    retry: false,
    // Always fetch fresh data — never use a stale cached null from an anonymous session
    staleTime: 0,
    refetchOnMount: 'always',
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useUserRegistry() {
  const { actor, isFetching } = useActor();
  return useQuery<Array<{ principal: Principal; role: UserRole; autoId: string }>>({
    queryKey: ['userRegistry'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getUserRegistry();
      } catch {
        // Backend may trap for unauthorized callers — return empty registry
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useAssignRoleWithAutoId() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ principal, role }: { principal: Principal; role: UserRole }) => {
      if (!actor) throw new Error('Not connected');
      return actor.assignRoleWithAutoId(principal, role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userRegistry'] });
      queryClient.invalidateQueries({ queryKey: ['myProfile'] });
    },
  });
}

export function useRevokeRole() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (principal: Principal) => {
      if (!actor) throw new Error('Not connected');
      return actor.revokeRole(principal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userRegistry'] });
      queryClient.invalidateQueries({ queryKey: ['myProfile'] });
    },
  });
}
