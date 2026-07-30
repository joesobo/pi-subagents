import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { describe, it } from "node:test";
import {
	getArtifactsDir,
	getProjectArtifactsDir,
	getProjectChainRunsDir,
	getProjectSubagentsDir,
	writeArtifact,
	writeMetadata,
} from "../../src/shared/artifacts.ts";

describe("project-local artifact paths", () => {
	it("places generated subagent files under .pi-subagents for a project cwd", () => {
		const cwd = path.join("tmp", "repo");
		assert.equal(getProjectSubagentsDir(cwd), path.join(cwd, ".pi-subagents"));
		assert.equal(getProjectArtifactsDir(cwd), path.join(cwd, ".pi-subagents", "artifacts"));
		assert.equal(getProjectChainRunsDir(cwd), path.join(cwd, ".pi-subagents", "chain-runs"));
		assert.equal(getArtifactsDir(null, cwd), path.join(cwd, ".pi-subagents", "artifacts"));
	});

	it("keeps the session artifact fallback when no project cwd is available", () => {
		const sessionFile = path.join("tmp", "sessions", "parent.jsonl");
		assert.equal(getArtifactsDir(sessionFile), path.join("tmp", "sessions", "subagent-artifacts"));
	});

	it("recreates missing parent directories immediately before artifact writes", () => {
		const root = fs.mkdtempSync(path.join(os.tmpdir(), "subagent-artifacts-"));
		const outputPath = path.join(root, "removed", "run", "output.md");
		const metadataPath = path.join(root, "removed", "run", "metadata.json");

		writeArtifact(outputPath, "result");
		fs.rmSync(path.join(root, "removed"), { recursive: true });
		writeMetadata(metadataPath, { status: "complete" });

		assert.equal(fs.readFileSync(metadataPath, "utf-8"), JSON.stringify({ status: "complete" }, null, 2));
		fs.rmSync(root, { recursive: true });
	});
});
