import { generatePublicId } from "@/common/id";
import { uploadFile } from "@/common/uploads";
import { Audit } from "@/server/audit";
import { withAuth } from "@/trpc/api/trpc";
import fs from "fs";
import { nanoid } from "nanoid";
import path from "path";
import { SafeMutationSchema } from "../schema";

export const createSafeProcedure = withAuth
  .input(SafeMutationSchema)
  .mutation(async ({ ctx, input }) => {
    const { userAgent, requestIp } = ctx;
    const user = ctx.session.user;
    const safeTemplate = input.safeTemplate;

    const data = {
      companyId: user.companyId,
      stakeholderId: input.stakeholderId,
      publicId: generatePublicId(),
      capital: input.capital,
      valuationCap: input.valuationCap,
      discountRate: input.discountRate,
      proRata: input.proRata,
      issueDate: new Date(input.issueDate),
      boardApprovalDate: new Date(input.boardApprovalDate),
      safeTemplate,
    };

    try {
      if (safeTemplate !== "CUSTOM") {
        const pdfPath = path.join(
          process.cwd(),
          "public",
          "yc",
          `${safeTemplate}.pdf`,
        );
        const pdfBuffer = fs.readFileSync(pdfPath);

        const file = {
          name: `safe-template-${nanoid()}`,
          type: "application/pdf",
          arrayBuffer: async () => Promise.resolve(pdfBuffer),
          size: pdfBuffer.byteLength,
        } as unknown as File;

        const { key, mimeType, name, size } = await uploadFile(
          file,
          {
            identifier: "templates",
            keyPrefix: "newsafe",
          },
          "privateBucket",
        );

        const bucketPayload = { key, mimeType, name, size };

        const { template } = await ctx.db.$transaction(async (txn) => {
          const { id, name } = await txn.bucket.create({ data: bucketPayload });

          const newSafe = await txn.safe.create({ data });
          console.log({ newSafe });

          const template = await ctx.db.template.create({
            data: {
              companyId: user.companyId,
              uploaderId: user.memberId,
              publicId: generatePublicId(),
              bucketId: id,
              name: name,
            },
          });
          console.log({ template });
          await Audit.create(
            {
              action: "safe.created",
              companyId: user.companyId,
              actor: { type: "user", id: ctx.session.user.id },
              context: { requestIp, userAgent },
              target: [{ type: "company", id: user.companyId }],
              summary: `${ctx.session.user.name} created a new SAFE agreement with YC template.`,
            },
            txn,
          );
          return { template };
        });

        return {
          success: true,
          message: "Created SAFEs agreement with YC template.",
          template,
        };
      }

      if (safeTemplate === "CUSTOM") {
        const documents = input.documents;

        if (documents?.length !== 1) return;

        const { template } = await ctx.db.$transaction(async (txn) => {
          await txn.safe.create({ data });

          const template = await txn.template.create({
            data: {
              companyId: user.companyId,
              uploaderId: user.memberId,
              publicId: generatePublicId(),
              bucketId: documents[0]!.bucketId,
              name: documents[0]!.name,
            },
          });

          await Audit.create(
            {
              action: "safe.created",
              companyId: user.companyId,
              actor: { type: "user", id: ctx.session.user.id },
              context: { requestIp, userAgent },
              target: [{ type: "company", id: user.companyId }],
              summary: `${ctx.session.user.name} created a new SAFE agreement with Custom template.`,
            },
            txn,
          );

          return { template };
        });

        return {
          success: true,
          message: "Created SAFEs agreement with custom template.",
          template,
        };
      }
    } catch (error) {
      console.error("Error creating safe:", error);
      return {
        success: false,
        message: "Oops ! something went out. Please try again later",
      };
    }
  });
