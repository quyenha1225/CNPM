export class AiSearchDto {
  /**
   * Câu tìm kiếm tự nhiên.
   * Ví dụ:
   * "Tôi cần RAM cho sinh viên, mở 10 đến 15 tab, giá dưới 2 triệu"
   */
  query!: string;

  /**
   * Có thể bỏ trống khi người dùng chưa đăng nhập.
   */
  customerId?: number;

  /**
   * Số lượng kết quả muốn nhận.
   * Mặc định 10, tối đa 20.
   */
  limit?: number;
}