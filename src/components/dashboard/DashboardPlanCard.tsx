export default function DashboardPlanCard() {
  return (
    <section className="plan-card" aria-label="현재 플랜">
      <div className="plan-title">
        <strong>Free 플랜</strong>
        <span>사용량 미연결</span>
      </div>
      <div className="usage-track" aria-hidden="true" />
      <p>템플릿을 간편하게 관리해 보세요.</p>
      <button type="button" className="upgrade-button" disabled>
        Pro로 업그레이드
      </button>
    </section>
  );
}
