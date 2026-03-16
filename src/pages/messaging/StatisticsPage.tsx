export default function StatisticsPage() {
  return (
    <div>
      <h4>통계</h4>
      <div>
        <ul>
          <li>상단 KPI카드 - 총 발송건수, 성공건수, 실패건수, 성공률</li>
          <li>라인차트 - 일별 발송량, 월별 발송량</li>
          <li>메시지 유형 발송 비율 - SMS, LMS, 알림톡</li>
          <li>Area Chart - 월별 누적 발송량 </li>
          <li>선택 - 시간대별 발송 분포, 실패 사유 분석 </li>
        </ul>
      </div>
    </div>
  );
}
