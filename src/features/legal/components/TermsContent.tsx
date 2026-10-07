import {
  LEGAL_CONTACT_EMAIL,
  LEGAL_EFFECTIVE_DATE,
  YOUTUBE_TERMS_URL,
} from "../lib/legal-info";
import { LegalLink, LegalList, LegalSection } from "./LegalSection";

// 서비스 이용약관 본문. YouTube API Developer Policies III.A가 요구하는 "YouTube 서비스
// 약관 링크 + 이 서비스를 쓰면 YouTube 서비스 약관에도 구속된다는 문구"가 2번 조항에
// 있습니다 — 고칠 때 빠뜨리지 마세요.
export default function TermsContent() {
  return (
    <>
      <p>
        이 약관은 NeumorPlayer(이하 “서비스”)를 이용하는 조건을 정합니다.
        서비스를 이용하면 이 약관에 동의하는 것으로 봅니다.
      </p>

      <LegalSection title="1. 서비스 소개">
        <p>
          서비스는 YouTube API Services로 YouTube 동영상을 검색하고, 이용자가
          고른 동영상에 제목·아티스트·태그를 붙여 라이브러리와 재생목록으로
          정리할 수 있게 하는, 개인이 운영하는 무료 서비스입니다. 동영상은
          YouTube 플레이어로 재생되며, 서비스는 동영상 파일을 저장하거나
          배포하지 않습니다.
        </p>
      </LegalSection>

      <LegalSection title="2. YouTube 서비스 약관">
        <p>
          서비스는 YouTube API Services를 사용합니다. 서비스를 이용함으로써
          이용자는{" "}
          <LegalLink href={YOUTUBE_TERMS_URL}>YouTube 서비스 약관</LegalLink>
          에 구속되는 것에 동의합니다.
        </p>
      </LegalSection>

      <LegalSection title="3. 계정">
        <LegalList>
          <li>
            이메일 또는 Google 계정으로 가입할 수 있으며, 계정 관리 책임은
            이용자에게 있습니다.
          </li>
          <li>
            프로필 메뉴의 설정 → 회원탈퇴에서 언제든 탈퇴할 수 있고, 탈퇴하면
            저장한 곡과 재생목록이 모두 삭제됩니다.
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection title="4. 이용자가 입력한 정보">
        <p>
          이용자가 입력한 제목·아티스트·태그와 재생목록은 본인의 라이브러리를
          정리하는 용도이며 다른 이용자에게 공개되지 않습니다.
        </p>
      </LegalSection>

      <LegalSection title="5. 동영상 콘텐츠">
        <p>
          각 동영상의 권리는 업로더와 권리자에게 있습니다. 동영상이
          YouTube에서 삭제되거나 비공개로 바뀌면 서비스에서도 재생할 수
          없습니다.
        </p>
      </LegalSection>

      <LegalSection title="6. 금지 행위">
        <LegalList>
          <li>자동화된 도구로 검색 등 요청을 대량으로 보내는 행위</li>
          <li>서비스 운영을 방해하거나 보안 장치를 우회하는 행위</li>
          <li>다른 사람의 계정을 사용하는 행위</li>
          <li>법령이나 YouTube 서비스 약관을 위반하는 행위</li>
        </LegalList>
        <p>위반하면 서비스 이용이 제한되거나 계정이 삭제될 수 있습니다.</p>
      </LegalSection>

      <LegalSection title="7. 서비스의 변경과 중단">
        <p>
          서비스는 개인이 운영하는 무료 서비스로, 기능이 바뀌거나 예고 없이
          중단될 수 있습니다. YouTube API의 정책이나 사용량 한도에 따라 검색
          등 일부 기능이 제한될 수 있습니다.
        </p>
      </LegalSection>

      <LegalSection title="8. 책임의 한계">
        <p>
          서비스는 있는 그대로 제공되며, 운영자의 고의 또는 중대한 과실이 없는
          한 서비스 이용으로 생긴 손해에 대해 책임지지 않습니다.
        </p>
      </LegalSection>

      <LegalSection title="9. 약관의 변경">
        <p>
          약관을 바꾸면 서비스 안에서 알립니다. 바뀐 약관이 시행된 뒤에도
          서비스를 계속 이용하면 바뀐 약관에 동의하는 것으로 봅니다.
        </p>
      </LegalSection>

      <LegalSection title="10. 문의처">
        <p>
          <LegalLink href={`mailto:${LEGAL_CONTACT_EMAIL}`}>
            {LEGAL_CONTACT_EMAIL}
          </LegalLink>
        </p>
      </LegalSection>

      <p>시행일: {LEGAL_EFFECTIVE_DATE}</p>
    </>
  );
}
