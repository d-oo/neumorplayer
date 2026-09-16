// 손으로 작성한 초기 타입입니다. docs/migrations/0001_init.sql을 실제 Supabase 프로젝트에 적용한 뒤에는
// `supabase gen types typescript --linked > src/lib/database.types.ts` 로 자동 생성된
// 파일로 교체하세요 (컬럼을 바꿀 때마다 손으로 맞추는 걸 피하기 위함입니다).

export interface Database {
  public: {
    Tables: {
      tracks: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          artist: string[];
          video_id: string;
          tags: string[];
          duration: number;
          play_count: number;
          recent_play: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          artist: string[];
          video_id: string;
          tags?: string[];
          duration: number;
          play_count?: number;
          recent_play?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["tracks"]["Insert"]>;
      };
      playlists: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["playlists"]["Insert"]>;
      };
      playlist_tracks: {
        Row: {
          playlist_id: string;
          track_id: string;
          position: number;
        };
        Insert: {
          playlist_id: string;
          track_id: string;
          position: number;
        };
        Update: Partial<
          Database["public"]["Tables"]["playlist_tracks"]["Insert"]
        >;
      };
    };
  };
}
