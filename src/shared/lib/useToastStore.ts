import { create } from "zustand";

// 화면 왼쪽 하단 알림 토스트(shared/components/Toast.tsx)의 상태 — old-src
// Alert.js(Home.js의 showAlert/alertMessage context)를 대체합니다. 어느 화면에서든
// useToastStore.getState().show(...) 또는 훅으로 꺼낸 show를 부르면 되고, 표시 시간·
// fade는 Toast 컴포넌트가 담당합니다.
//
// id는 같은 문구를 연달아 띄울 때도 타이머를 새로 시작하기 위한 값입니다(message만
// 비교하면 같은 문구 재호출을 알아채지 못함).
//
// 사라지는 방식이 두 가지라 instant로 구분합니다: 표시 시간이 지나 자동으로 닫히면
// (hide) fade out, 사용자가 X를 누르면(dismiss) fade 없이 바로 사라집니다.
interface ToastState {
  message: string;
  id: number;
  visible: boolean;
  instant: boolean;
  show: (message: string) => void;
  hide: () => void;
  dismiss: () => void;
}

export const useToastStore = create<ToastState>()((set) => ({
  message: "",
  id: 0,
  visible: false,
  instant: false,
  show: (message) =>
    set((s) => ({ message, id: s.id + 1, visible: true, instant: false })),
  hide: () => set({ visible: false, instant: false }),
  dismiss: () => set({ visible: false, instant: true }),
}));
