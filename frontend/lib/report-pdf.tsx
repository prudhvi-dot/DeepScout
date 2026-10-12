import React from "react";
import {
  Document,
  Font,
  Link,
  Page,
  StyleSheet,
  Text,
  View,
  pdf,
} from "@react-pdf/renderer";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import type { PhrasingContent, Root, RootContent, Table } from "mdast";

/* -------------------------------------------------------------------------- */
/*  Setup                                                                     */
/* -------------------------------------------------------------------------- */

// Don't hyphenate words (keeps URLs and identifiers intact).
Font.registerHyphenationCallback((word) => [word]);

const colors = {
  text: "#1F2937",
  heading: "#0F172A",
  muted: "#6B7280",
  border: "#E5E7EB",
  codeBg: "#F3F4F6",
  tableHead: "#F3F4F6",
  link: "#1D4ED8",
  quoteBar: "#CBD5E1",
};

const HEADING_SIZES = [22, 17, 14, 12, 11, 10.5];

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#FFFFFF",
    paddingTop: 44,
    paddingBottom: 60,
    paddingHorizontal: 44,
    fontFamily: "Helvetica",
    fontSize: 10.5,
    lineHeight: 1.5,
    color: colors.text,
  },
  metaBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 0.75,
    borderBottomColor: colors.border,
    paddingBottom: 6,
    marginBottom: 14,
  },
  metaLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    letterSpacing: 1,
    color: colors.muted,
  },
  metaDate: {
    fontSize: 8,
    color: colors.muted,
  },
  title: {
    fontFamily: "Helvetica-Bold",
    fontSize: 22,
    lineHeight: 1.25,
    color: colors.heading,
    marginBottom: 10,
  },
  paragraph: {
    marginBottom: 7,
  },
  paragraphTight: {
    marginBottom: 2,
  },
  listItem: {
    flexDirection: "row",
    marginBottom: 2,
  },
  listMarker: {
    width: 22,
    paddingRight: 6,
    textAlign: "right",
  },
  listBody: {
    flex: 1,
  },
  blockquote: {
    borderLeftWidth: 3,
    borderLeftColor: colors.quoteBar,
    paddingLeft: 10,
    marginBottom: 7,
    color: colors.muted,
  },
  codeBlock: {
    backgroundColor: colors.codeBg,
    borderWidth: 0.75,
    borderColor: colors.border,
    borderRadius: 4,
    padding: 8,
    marginBottom: 8,
  },
  codeText: {
    fontFamily: "Courier",
    fontSize: 8.5,
    lineHeight: 1.4,
  },
  hr: {
    borderBottomWidth: 0.75,
    borderBottomColor: colors.border,
    marginVertical: 10,
  },
  table: {
    borderWidth: 0.75,
    borderColor: colors.border,
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.75,
    borderBottomColor: colors.border,
  },
  tableHeadRow: {
    backgroundColor: colors.tableHead,
  },
  tableCell: {
    padding: 5,
    borderRightWidth: 0.75,
    borderRightColor: colors.border,
  },
  tableCellText: {
    fontSize: 9.5,
    lineHeight: 1.4,
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 44,
    right: 44,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 0.75,
    borderTopColor: colors.border,
    paddingTop: 6,
  },
  footerText: {
    fontSize: 8,
    color: colors.muted,
  },
});

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

type Decoration =
  | "underline"
  | "line-through"
  | "underline line-through";

type InlineCtx = {
  bold?: boolean;
  italic?: boolean;
  strike?: boolean;
  link?: boolean;
};

type BlockOpts = {
  listDepth: number;
  tight: boolean;
};

type AnyNode = { type?: string; value?: unknown; children?: AnyNode[] };

function plainText(node: AnyNode): string {
  if (typeof node.value === "string") return node.value;
  return (node.children ?? []).map(plainText).join("");
}

/**
 * The built-in PDF fonts (Helvetica/Courier) only cover Latin text.
 * Swap a few common symbols and drop emoji so they don't render as garbage.
 * For other scripts (Telugu, Hindi, CJK...) register a custom font instead.
 */
function sanitize(text: string): string {
  return text
    .replace(/\u2192/g, "->")
    .replace(/\u2190/g, "<-")
    .replace(/\u2265/g, ">=")
    .replace(/\u2264/g, "<=")
    .replace(/\u2248/g, "~")
    .replace(/\u2212/g, "-")
    .replace(/\u00A0/g, " ")
    .replace(/[\u200B-\u200D\uFE0E\uFE0F]/g, "")
    .replace(/\p{Extended_Pictographic}/gu, "");
}

function isSafeUrl(url: string): boolean {
  return /^(https?:\/\/|mailto:)/i.test(url);
}

function fontFor(ctx: InlineCtx): string {
  if (ctx.bold && ctx.italic) return "Helvetica-BoldOblique";
  if (ctx.bold) return "Helvetica-Bold";
  if (ctx.italic) return "Helvetica-Oblique";
  return "Helvetica";
}

function textStyle(ctx: InlineCtx) {
  const textDecoration: Decoration | undefined =
    ctx.link && ctx.strike
      ? "underline line-through"
      : ctx.link
        ? "underline"
        : ctx.strike
          ? "line-through"
          : undefined;

  return {
    fontFamily: fontFor(ctx),
    ...(ctx.link ? { color: colors.link } : {}),
    ...(textDecoration ? { textDecoration } : {}),
  };
}

/* -------------------------------------------------------------------------- */
/*  Inline rendering (text, bold, italic, code, links...)                     */
/* -------------------------------------------------------------------------- */

function renderInline(
  nodes: PhrasingContent[],
  ctx: InlineCtx = {},
  keyPrefix = ""
): React.ReactNode[] {
  return nodes.map((node, i) => {
    const key = `${keyPrefix}${i}`;

    switch (node.type) {
      case "text":
        return (
          <Text key={key} style={textStyle(ctx)}>
            {sanitize(node.value).replace(/\s*\n\s*/g, " ")}
          </Text>
        );

      case "strong":
        return (
          <React.Fragment key={key}>
            {renderInline(node.children, { ...ctx, bold: true }, `${key}-`)}
          </React.Fragment>
        );

      case "emphasis":
        return (
          <React.Fragment key={key}>
            {renderInline(node.children, { ...ctx, italic: true }, `${key}-`)}
          </React.Fragment>
        );

      case "delete":
        return (
          <React.Fragment key={key}>
            {renderInline(node.children, { ...ctx, strike: true }, `${key}-`)}
          </React.Fragment>
        );

      case "inlineCode":
        return (
          <Text
            key={key}
            style={{
              fontFamily: "Courier",
              fontSize: 9.5,
              backgroundColor: colors.codeBg,
              color: ctx.link ? colors.link : colors.heading,
            }}
          >
            {sanitize(node.value)}
          </Text>
        );

      case "link": {
        if (!isSafeUrl(node.url)) {
          return (
            <React.Fragment key={key}>
              {renderInline(node.children, ctx, `${key}-`)}
            </React.Fragment>
          );
        }

        return (
          <Link
            key={key}
            src={node.url}
            style={{ color: colors.link, textDecoration: "underline" }}
          >
            {renderInline(node.children, { ...ctx, link: true }, `${key}-`)}
          </Link>
        );
      }

      case "image": {
        // Remote images are often blocked by CORS, so render them as a link.
        const label = `[Image: ${sanitize(node.alt || "image")}]`;

        if (!isSafeUrl(node.url)) {
          return (
            <Text key={key} style={textStyle(ctx)}>
              {label}
            </Text>
          );
        }

        return (
          <Link
            key={key}
            src={node.url}
            style={{ color: colors.link, textDecoration: "underline" }}
          >
            {label}
          </Link>
        );
      }

      case "break":
        return <Text key={key}>{"\n"}</Text>;

      case "html":
        return /^<br\s*\/?>$/i.test(node.value.trim()) ? (
          <Text key={key}>{"\n"}</Text>
        ) : null;

      default:
        return "children" in node ? (
          <React.Fragment key={key}>
            {renderInline(
              (node as { children: PhrasingContent[] }).children,
              ctx,
              `${key}-`
            )}
          </React.Fragment>
        ) : null;
    }
  });
}

/* -------------------------------------------------------------------------- */
/*  Block rendering (headings, lists, tables, code...)                        */
/* -------------------------------------------------------------------------- */

function renderTable(node: Table, key: string): React.ReactNode {
  const rows = node.children;
  if (rows.length === 0) return null;

  const colCount = Math.max(...rows.map((row) => row.children.length));

  // Size columns roughly by content length so wide columns get more room.
  const weights = Array.from({ length: colCount }, (_, c) => {
    const longest = Math.max(
      ...rows.map((row) =>
        row.children[c] ? plainText(row.children[c] as AnyNode).length : 0
      )
    );
    return Math.min(Math.max(longest, 6), 40);
  });

  return (
    <View key={key} style={styles.table}>
      {rows.map((row, r) => {
        const isHead = r === 0;
        const isLast = r === rows.length - 1;

        return (
          <View
            key={`${key}-r${r}`}
            wrap={false}
            style={[
              styles.tableRow,
              isHead ? styles.tableHeadRow : {},
              isLast ? { borderBottomWidth: 0 } : {},
            ]}
          >
            {Array.from({ length: colCount }, (_, c) => {
              const cell = row.children[c];
              const align = node.align?.[c] ?? "left";

              return (
                <View
                  key={`${key}-r${r}-c${c}`}
                  style={[
                    styles.tableCell,
                    {
                      flexGrow: weights[c],
                      flexShrink: 1,
                      flexBasis: 0,
                    },
                    c === colCount - 1 ? { borderRightWidth: 0 } : {},
                  ]}
                >
                  <Text style={[styles.tableCellText, { textAlign: align }]}>
                    {cell
                      ? renderInline(
                          cell.children,
                          isHead ? { bold: true } : {},
                          `${key}-r${r}-c${c}-`
                        )
                      : ""}
                  </Text>
                </View>
              );
            })}
          </View>
        );
      })}
    </View>
  );
}

function renderBlocks(
  nodes: RootContent[],
  opts: BlockOpts,
  keyPrefix = ""
): React.ReactNode[] {
  return nodes.map((node, i) => renderBlock(node, opts, `${keyPrefix}${i}`));
}

function renderBlock(
  node: RootContent,
  opts: BlockOpts,
  key: string
): React.ReactNode {
  switch (node.type) {
    case "heading": {
      const size = HEADING_SIZES[Math.min(node.depth, 6) - 1];
      const hasRule = node.depth <= 2;

      return (
        <View
          key={key}
          wrap={false}
          minPresenceAhead={48}
          style={[
            {
              marginTop: node.depth <= 2 ? 16 : 12,
              marginBottom: 6,
            },
            hasRule
              ? {
                  borderBottomWidth: 0.75,
                  borderBottomColor: colors.border,
                  paddingBottom: 3,
                }
              : {},
          ]}
        >
          <Text
            style={{
              fontFamily: "Helvetica-Bold",
              fontSize: size,
              lineHeight: 1.25,
              color: colors.heading,
            }}
          >
            {renderInline(node.children, { bold: true }, `${key}-`)}
          </Text>
        </View>
      );
    }

    case "paragraph":
      return (
        <Text
          key={key}
          style={opts.tight ? styles.paragraphTight : styles.paragraph}
        >
          {renderInline(node.children, {}, `${key}-`)}
        </Text>
      );

    case "list": {
      const start = node.start ?? 1;

      return (
        <View
          key={key}
          style={{
            marginTop: opts.tight ? 2 : 0,
            marginBottom: opts.tight ? 2 : 7,
          }}
        >
          {node.children.map((item, i) => {
            const marker =
              item.checked === true
                ? "[x]"
                : item.checked === false
                  ? "[ ]"
                  : node.ordered
                    ? `${start + i}.`
                    : opts.listDepth === 0
                      ? "\u2022"
                      : "\u2013";

            return (
              <View key={`${key}-${i}`} style={styles.listItem}>
                <Text style={styles.listMarker}>{marker}</Text>
                <View style={styles.listBody}>
                  {renderBlocks(
                    item.children,
                    { listDepth: opts.listDepth + 1, tight: true },
                    `${key}-${i}-`
                  )}
                </View>
              </View>
            );
          })}
        </View>
      );
    }

    case "blockquote":
      return (
        <View key={key} style={styles.blockquote}>
          {renderBlocks(node.children, { ...opts, tight: false }, `${key}-`)}
        </View>
      );

    case "code":
      return (
        <View key={key} style={styles.codeBlock}>
          <Text style={styles.codeText}>
            {sanitize(node.value).replace(/\t/g, "  ")}
          </Text>
        </View>
      );

    case "thematicBreak":
      return <View key={key} style={styles.hr} />;

    case "table":
      return renderTable(node, key);

    default:
      // html, definitions, footnotes, etc. are skipped.
      return null;
  }
}

/* -------------------------------------------------------------------------- */
/*  Document                                                                  */
/* -------------------------------------------------------------------------- */

function ReportPdfDocument({
  markdown,
  title,
}: {
  markdown: string;
  title: string;
}) {
  const tree = unified().use(remarkParse).use(remarkGfm).parse(markdown) as Root;

  const date = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const first = tree.children[0];
  const startsWithH1 = first?.type === "heading" && first.depth === 1;

  return (
    <Document title={title || "Research Report"} creator="Research Workspace">
      <Page size="A4" style={styles.page}>
        <View style={styles.metaBar}>
          <Text style={styles.metaLabel}>RESEARCH REPORT</Text>
          <Text style={styles.metaDate}>{date}</Text>
        </View>

        {!startsWithH1 && title ? (
          <Text style={styles.title}>{sanitize(title)}</Text>
        ) : null}

        {renderBlocks(tree.children, { listDepth: 0, tight: false }, "b")}

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>{sanitize(title || "")}</Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) =>
              `${pageNumber} / ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}

/* -------------------------------------------------------------------------- */
/*  Public API                                                                */
/* -------------------------------------------------------------------------- */

export async function downloadReportPdf({
  markdown,
  title,
  filename,
}: {
  markdown: string;
  title: string;
  filename: string;
}): Promise<void> {
  const blob = await pdf(
    <ReportPdfDocument markdown={markdown} title={title} />
  ).toBlob();

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `${filename}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}