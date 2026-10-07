import {
  GOOGLE_PRIVACY_URL,
  LEGAL_CONTACT_EMAIL,
  LEGAL_EFFECTIVE_DATE,
  YOUTUBE_TERMS_URL,
} from "../lib/legal-info";
import { LegalLink, LegalList, LegalSection } from "./LegalSection";

// 개인정보처리방침 본문. YouTube API Developer Policies III.A가 요구하는 항목(YouTube
// API Services 사용 고지, Google 개인정보처리방침 링크, 수집·이용·공유하는 정보 설명,
// 제3자 콘텐츠·광고 고지, 기기 저장소/쿠키 사용 고지)을 담고 있습니다 — 저장하는
// 데이터나 쓰는 외부 서비스가 바뀌면 이 본문도 같이 고치세요.
export default function PrivacyPolicyContent() {
  return (
    <>
      <p>
        NeumorPlayer(이하 “서비스”)는 이용자의 개인정보를 아래와 같이
        처리합니다. 본 서비스는 YouTube API Services를 사용합니다.
      </p>

      <LegalSection title="1. 수집하는 정보">
        <LegalList>
          <li>
            이메일로 회원가입하는 경우: 이메일 주소, 비밀번호(암호화되어
            저장되며 운영자도 원래 값을 알 수 없습니다)
          </li>
          <li>
            Google 계정으로 로그인하는 경우: Google이 제공하는 이메일 주소,
            이름, 프로필 사진 주소, Google 계정 식별자
          </li>
          <li>
            이용자가 직접 저장하는 정보: 라이브러리에 추가한 곡(YouTube 동영상
            ID와 직접 입력한 제목·아티스트·태그), 재생목록, 화면 테마 설정
          </li>
          <li>
            서비스 이용 중 생기는 정보: 곡별 재생 횟수와 마지막 재생 시각,
            YouTube Data API로 받아온 동영상 재생시간과 재생 가능 여부
          </li>
          <li>
            접속 기록: 서비스에 접속하면 호스팅 서버에 IP 주소, 요청 주소(검색어
            포함), 접속 시각 같은 기록이 남을 수 있습니다.
          </li>
          <li>
            비회원(게스트)으로 검색·재생만 이용하는 경우 검색어나 재생 기록을
            데이터베이스에 저장하지 않습니다.
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection title="2. 정보 이용 목적">
        <LegalList>
          <li>회원 식별과 로그인 상태 유지</li>
          <li>라이브러리·재생목록·재생 기능 제공</li>
          <li>
            YouTube Data API를 통한 동영상 검색, 재생시간·재생 가능 여부 확인
          </li>
          <li>서비스 오류 확인과 부정 이용 방지</li>
        </LegalList>
      </LegalSection>

      <LegalSection title="3. 보관 기간과 삭제">
        <LegalList>
          <li>
            회원 정보와 이용자가 저장한 정보는 회원 탈퇴 즉시 삭제됩니다. 프로필
            메뉴의 설정 → 회원탈퇴에서 직접 탈퇴할 수 있습니다.
          </li>
          <li>
            YouTube Data API로 받아온 정보는 30일을 넘겨 보관하지 않고 30일
            안에 다시 받아와 갱신합니다. YouTube에서 삭제되거나 비공개로 바뀐
            동영상은 해당 정보를 지웁니다.
          </li>
          <li>접속 기록은 호스팅 업체의 기록 보관 기간이 지나면 삭제됩니다.</li>
        </LegalList>
      </LegalSection>

      <LegalSection title="4. 브라우저 저장소와 쿠키">
        <LegalList>
          <li>
            서비스는 브라우저의 로컬 저장소(localStorage)에 로그인 상태,
            볼륨·음소거 설정, 개인정보 안내 배너 확인 여부를 저장합니다.
            브라우저에서 사이트 데이터를 지우면 함께 삭제됩니다.
          </li>
          <li>
            동영상 재생에 쓰는 YouTube 플레이어는 Google(YouTube)이 제공하며,
            Google이 쿠키 등으로 기기 정보를 수집하거나 플레이어 안에 광고를
            표시할 수 있습니다. 이는 Google 개인정보처리방침을 따릅니다.
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection title="5. 외부 서비스">
        <LegalList>
          <li>Supabase: 회원 인증과 데이터베이스</li>
          <li>Vercel: 웹사이트 호스팅과 서버 기능 실행</li>
          <li>
            Google: YouTube API Services(동영상 검색·정보 조회·재생)와 Google
            로그인. 이 서비스는 YouTube API Services를 사용하며,{" "}
            <LegalLink href={GOOGLE_PRIVACY_URL}>
              Google 개인정보처리방침
            </LegalLink>
            이 함께 적용됩니다.
          </li>
          <li>
            위 서비스의 서버는 해외에 있을 수 있습니다. 이 외의 제3자에게
            개인정보를 판매하거나 제공하지 않습니다.
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection title="6. 아동 대상 콘텐츠">
        <p>
          YouTube에서 Made For Kids로 지정한 동영상은 검색 결과에서
          제외합니다.
        </p>
      </LegalSection>

      <LegalSection title="7. 이용자의 권리">
        <p>
          이용자는 저장한 곡과 재생목록을 언제든 직접 조회·삭제할 수 있고,
          회원 탈퇴로 모든 정보를 삭제할 수 있습니다. 그 밖의 열람·정정·삭제
          요청은 아래 문의처로 보내 주세요.
        </p>
      </LegalSection>

      <LegalSection title="8. 문의처">
        <p>
          개인정보 관련 문의:{" "}
          <LegalLink href={`mailto:${LEGAL_CONTACT_EMAIL}`}>
            {LEGAL_CONTACT_EMAIL}
          </LegalLink>
        </p>
      </LegalSection>

      <LegalSection title="9. 관련 문서">
        <p>
          본 서비스를 이용하면{" "}
          <LegalLink href={YOUTUBE_TERMS_URL}>YouTube 서비스 약관</LegalLink>
          에도 동의하는 것으로 간주됩니다.
        </p>
      </LegalSection>

      <p>시행일: {LEGAL_EFFECTIVE_DATE}</p>
    </>
  );
}
