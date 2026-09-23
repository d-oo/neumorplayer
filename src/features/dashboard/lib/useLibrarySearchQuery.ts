import { useState } from "react";
import { useSearchParams } from "react-router-dom";

// 헤더의 "라이브러리 내 검색"이 쓰는 상태. 커밋된 검색어는 URL의 ?q=에 있고
// (그래야 새로고침·뒤로가기에서 살아남고, HomeLayout이 Outlet 대신 검색 결과
// 화면을 보여줄지 판단할 수 있습니다), 입력창에 타이핑 중인 값은 그와 별개로
// 로컬에 둡니다 — 엔터나 검색 아이콘을 눌렀을 때만 ?q=로 커밋해서, 한 글자
// 칠 때마다 검색 결과 화면으로 넘어가지 않게 합니다.
//
// query가 밖에서 바뀌면(뒤로가기, 다른 탭으로 이동 등) 입력창도 따라가야 하는데,
// useEffect 대신 React 공식 문서가 권장하는 "prop 변경 시 상태 조정" 패턴(렌더 중
// 직접 비교 후 setState)을 씁니다. useEffect로 하면 커밋된 값을 화면에 한 번 그리고
// 나서 한 프레임 뒤에 다시 리렌더가 발생합니다.
export function useLibrarySearchQuery() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";

  const [inputValue, setInputValue] = useState(query);
  const [syncedQuery, setSyncedQuery] = useState(query);
  if (query !== syncedQuery) {
    setSyncedQuery(query);
    setInputValue(query);
  }

  function commitQuery(value: string) {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value) next.set("q", value);
        else next.delete("q");
        return next;
      },
      { replace: true },
    );
  }

  return { query, inputValue, setInputValue, commitQuery };
}
