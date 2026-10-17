import pool from "../config/db.js";
import {
  getDashboardOverview,
  listUsers,
  getUserDetail,
  suspendUser,
  reactivateUser,
  revokeUserKey,
  grantCertificateEligibility,
  revokeCertificateEligibility,
  listApiCatalog,
  updateApiProductStatus,
  listPayments,
  listCertificates,
  listAuditLogs,
  generateCsvExport,
} from "../services/admin.service.js";

export async function handleGetDashboardOverview(req, res, next) {
  try {
    const data = await getDashboardOverview();
    res.status(200).json({
      success: true,
      ...data,
      data,
      overview: data,
      recentTransactions: data.payments?.recentTransactions || [],
      topApis: data.apis?.topApis || [],
    });
  } catch (err) {
    next(err);
  }
}

export async function handleListUsers(req, res, next) {
  try {
    const { search, status, role, eligibleOnly, page, limit, sortBy, sortOrder } = req.query;
    const result = await listUsers({
      search: search || "",
      status: status || "all",
      role: role || "all",
      eligibleOnly: eligibleOnly === "true",
      page: parseInt(page || "1", 10),
      limit: parseInt(limit || "50", 10),
      sortBy: sortBy || "created_at",
      sortOrder: sortOrder || "DESC",
    });
    res.status(200).json({ success: true, ...result, total: result.pagination?.total || 0 });
  } catch (err) {
    next(err);
  }
}

export async function handleGetUserDetail(req, res, next) {
  try {
    const { id } = req.params;
    const detail = await getUserDetail(id);
    res.status(200).json({
      success: true,
      ...detail,
      stats: {
        totalRequests: detail.usage?.totalRequests || 0,
        totalSpend: detail.payments?.totalSpentInr || 0,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function handleToggleUserStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;
    if (status === "suspended") {
      const result = await suspendUser(id, req.user, reason);
      return res.status(200).json(result);
    } else {
      const result = await reactivateUser(id, req.user);
      return res.status(200).json(result);
    }
  } catch (err) {
    next(err);
  }
}

export async function handleSuspendUser(req, res, next) {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const result = await suspendUser(id, req.user, reason);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function handleReactivateUser(req, res, next) {
  try {
    const { id } = req.params;
    const result = await reactivateUser(id, req.user);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function handleRevokeUserKey(req, res, next) {
  try {
    const { id, keyId } = req.params;
    const result = await revokeUserKey(id, keyId, req.user);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function handleGrantCertificateEligibility(req, res, next) {
  try {
    const { id } = req.params;
    const { programTitle, organization, organizationName, startDate, completionDate, adminNotes } = req.body;
    const result = await grantCertificateEligibility({
      userId: id,
      programTitle,
      organization: organization || organizationName || "Kruu",
      startDate,
      completionDate,
      adminNotes,
      adminUser: req.user,
    });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function handleRevokeCertificateEligibility(req, res, next) {
  try {
    const { id, eligibilityId } = req.params;
    const { reason } = req.body || {};
    const result = await revokeCertificateEligibility(id, eligibilityId, req.user, reason);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function handleListApiCatalog(req, res, next) {
  try {
    const { search, status } = req.query;
    const products = await listApiCatalog({ search, status });
    res.status(200).json({ success: true, products, apis: products });
  } catch (err) {
    next(err);
  }
}

export async function handleUpdateApiProduct(req, res, next) {
  try {
    const { id } = req.params;
    const { status, name, tagline, description, category } = req.body;
    if (status) {
      await updateApiProductStatus(id, status, req.user);
    }
    if (name || tagline || description || category) {
      await pool.query(
        `UPDATE api_products
         SET name = COALESCE($1, name),
             tagline = COALESCE($2, tagline),
             description = COALESCE($3, description),
             category = COALESCE($4, category),
             updated_at = NOW()
         WHERE id = $5;`,
        [name || null, tagline || null, description || null, category || null, id]
      );
    }
    res.status(200).json({ success: true, message: "API product updated successfully." });
  } catch (err) {
    next(err);
  }
}

export async function handleUpdateApiProductStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const result = await updateApiProductStatus(id, status, req.user);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function handleListPayments(req, res, next) {
  try {
    const { page, limit, type, status } = req.query;
    const result = await listPayments({
      page: parseInt(page || "1", 10),
      limit: parseInt(limit || "20", 10),
      type: type || "all",
      status: status || "all",
    });
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export async function handleListCertificates(req, res, next) {
  try {
    const { page, limit, status } = req.query;
    const result = await listCertificates({
      page: parseInt(page || "1", 10),
      limit: parseInt(limit || "20", 10),
      status: status || "all",
    });
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export async function handleListAuditLogs(req, res, next) {
  try {
    const { page, limit } = req.query;
    const result = await listAuditLogs({
      page: parseInt(page || "1", 10),
      limit: parseInt(limit || "25", 10),
    });
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export async function handleExportReportCsv(req, res, next) {
  try {
    const { reportType } = req.params;
    const csvData = await generateCsvExport(reportType, req.user);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="kruu_${reportType}_export_${Date.now()}.csv"`
    );
    res.status(200).send(csvData);
  } catch (err) {
    next(err);
  }
}

export async function handleAdminAuthMe(req, res) {
  res.status(200).json({
    success: true,
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      avatar: req.user.avatar,
    },
  });
}
