import { GalleryTemplate } from "./types";

/**
 * 템플릿 갤러리 UI 개발 및 테스트용 임시 데이터
 * TODO: API 연동 시 useGalleryTemplates로 대체하고 제거할 것
 */
const samples: [GalleryTemplate["category"], string, string, string, string][] = [
  ["WORK", "업무", "회의 일정 조율", "/회의", "안녕하세요, {{이름}}님. 다음 주 {{날짜}}에 회의 가능하실까요? 편하신 시간을 알려주시면 일정 맞춰보겠습니다."],
  ["WORK", "업무", "업무 진행 공유", "/진행", "{{프로젝트명}} 진행 상황 공유드립니다. 현재 {{진행률}} 완료되었으며, 남은 작업은 이번 주 내 마무리 예정입니다."],
  ["WORK", "업무", "자료 요청", "/요청", "{{자료명}} 자료를 {{날짜}}까지 전달 부탁드립니다."],
  ["WORK", "업무", "휴가 공유", "/휴가", "{{날짜}}에 연차 사용 예정입니다. 부재 중 급한 건은 {{담당자}}님께 연락 부탁드립니다."],
  ["WORK", "업무", "퇴근 인사", "/퇴근", "오늘도 고생 많으셨습니다. 먼저 퇴근하겠습니다."],
  ["SALES", "영업", "프로젝트 견적 안내", "/견적", "안녕하세요, {{고객명}}님. 요청 주신 프로젝트의 예상 견적은 {{금액}}원이며, 작업 기간은 {{기간}}입니다. 검토 후 편하게 회신 부탁드립니다."],
  ["SALES", "영업", "미팅 후 감사 인사", "/미팅감사", "{{고객명}}님, 오늘 귀한 시간 내주셔서 감사합니다. 논의드린 내용 정리해서 곧 전달드리겠습니다."],
  ["SALES", "영업", "제안서 전달", "/제안", "요청하신 제안서를 첨부드립니다. 궁금하신 점은 언제든 말씀해 주세요."],
  ["CUSTOMER_SERVICE", "고객 응대", "배송 지연 안내", "/지연", "{{고객명}}님, 주문하신 상품의 배송이 {{사유}}로 지연되고 있습니다. 불편을 드려 죄송합니다."],
  ["CUSTOMER_SERVICE", "고객 응대", "환불 처리 완료", "/환불", "요청하신 환불이 처리되었습니다. 영업일 기준 {{기간}} 내 입금됩니다."],
  ["PERSONAL", "개인", "생일 축하", "/생일", "{{이름}}아 생일 축하해! 오늘 하루 행복하게 보내."],
  ["PERSONAL", "개인", "안부 인사", "/안부", "{{이름}}아 잘 지내고 있지? 시간 될 때 밥 한번 먹자."],
];

const sampleGalleryTemplates: GalleryTemplate[] = samples.map(
  ([category, categoryName, title, shortcut, content], index) => ({
    galleryTemplateId: index + 1,
    category,
    categoryName,
    title,
    shortcut,
    content,
    variables: Array.from(content.matchAll(/\{\{(.+?)\}\}/g), (match) => match[1]),
  })
);

export default sampleGalleryTemplates;
