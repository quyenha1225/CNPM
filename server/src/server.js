import "dotenv/config";
import cors from "cors";
import express from "express";
import pg from "pg";

const app = express();
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const roles = ["Admin", "Sales Staff", "Technical Staff", "Warehouse Staff"];
const phonePattern = /^(0|\+84)\d{9,10}$/;

app.use(cors());
app.use(express.json());

const validateStaff = (body) => {
  const { full_name, email, phone, role, avatar } = body;
  const errors = {};
  if (!full_name?.trim()) errors.full_name = "Họ tên là bắt buộc";
  if (!/^\S+@\S+\.\S+$/.test(email || "")) errors.email = "Email không hợp lệ";
  if (!phonePattern.test((phone || "").replace(/[.\s-]/g, ""))) errors.phone = "Số điện thoại không hợp lệ";
  if (!roles.includes(role)) errors.role = "Vai trò không hợp lệ";
  if (avatar && !/^https?:\/\//.test(avatar)) errors.avatar = "Avatar phải là URL hợp lệ";
  return errors;
};
const sendDbError = (error, res) => {
  if (error.code === "23505") return res.status(409).json({ message: "Email hoặc số điện thoại đã tồn tại" });
  console.error(error);
  return res.status(500).json({ message: "Lỗi máy chủ" });
};

// GET /api/staffs?search=&role=&status=&page=1&limit=10
app.get("/api/staffs", async (req, res) => {
  const { search = "", role, status, page = 1, limit = 10 } = req.query;
  const pageNumber = Math.max(Number(page), 1); const take = Math.min(Math.max(Number(limit), 1), 100);
  const filters = []; const values = [];
  if (search) { values.push(`%${search}%`); filters.push(`(full_name ILIKE $${values.length} OR email ILIKE $${values.length} OR phone ILIKE $${values.length})`); }
  if (role && roles.includes(role)) { values.push(role); filters.push(`role = $${values.length}`); }
  if (status && ["active", "inactive"].includes(status)) { values.push(status); filters.push(`status = $${values.length}`); }
  const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
  try { const count = await pool.query(`SELECT COUNT(*) FROM staffs ${where}`, values); values.push(take, (pageNumber - 1) * take); const data = await pool.query(`SELECT * FROM staffs ${where} ORDER BY created_at DESC LIMIT $${values.length - 1} OFFSET $${values.length}`, values); res.json({ data: data.rows, meta: { page: pageNumber, limit: take, total: Number(count.rows[0].count) } }); } catch (error) { sendDbError(error, res); }
});

app.post("/api/staffs", async (req, res) => { const errors = validateStaff(req.body); if (Object.keys(errors).length) return res.status(422).json({ message: "Dữ liệu không hợp lệ", errors }); try { const { full_name, email, phone, role, avatar = null } = req.body; const result = await pool.query("INSERT INTO staffs (full_name,email,phone,role,avatar) VALUES ($1,$2,$3,$4,$5) RETURNING *", [full_name.trim(), email.trim().toLowerCase(), phone.trim(), role, avatar]); res.status(201).json({ data: result.rows[0] }); } catch (error) { sendDbError(error, res); } });

app.put("/api/staffs/:id", async (req, res) => { const errors = validateStaff(req.body); if (Object.keys(errors).length) return res.status(422).json({ message: "Dữ liệu không hợp lệ", errors }); try { const { full_name, email, phone, role, avatar = null } = req.body; const result = await pool.query("UPDATE staffs SET full_name=$1,email=$2,phone=$3,role=$4,avatar=$5 WHERE id=$6 RETURNING *", [full_name.trim(), email.trim().toLowerCase(), phone.trim(), role, avatar, req.params.id]); if (!result.rowCount) return res.status(404).json({ message: "Không tìm thấy nhân viên" }); res.json({ data: result.rows[0] }); } catch (error) { sendDbError(error, res); } });

app.patch("/api/staffs/:id/status", async (req, res) => { const { status } = req.body; if (!["active", "inactive"].includes(status)) return res.status(422).json({ message: "Trạng thái không hợp lệ" }); try { const result = await pool.query("UPDATE staffs SET status=$1 WHERE id=$2 RETURNING *", [status, req.params.id]); if (!result.rowCount) return res.status(404).json({ message: "Không tìm thấy nhân viên" }); res.json({ data: result.rows[0] }); } catch (error) { sendDbError(error, res); } });

app.delete("/api/staffs/:id", async (req, res) => { try { const result = await pool.query("DELETE FROM staffs WHERE id=$1 RETURNING id", [req.params.id]); if (!result.rowCount) return res.status(404).json({ message: "Không tìm thấy nhân viên" }); res.status(204).end(); } catch (error) { sendDbError(error, res); } });

app.listen(process.env.PORT || 5000, () => console.log(`Staff API listening on port ${process.env.PORT || 5000}`));
