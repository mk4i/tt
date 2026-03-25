import test from "node:test";
import assert from "node:assert/strict";

import { fetchTimetables } from "./generate-data.js";

test("fetchTimetables posts the expected payload and returns parsed JSON", async () => {
	const originalFetch = globalThis.fetch;
	const fetchCalls = [];
	const responsePayload = {
		r: {
			regular: {
				timetables: [{ tt_num: 42, text: "ProTERA Test" }],
			},
		},
	};

	globalThis.fetch = async (url, options) => {
		fetchCalls.push({ url, options });
		return {
			ok: true,
			async json() {
				return responsePayload;
			},
		};
	};

	try {
		const result = await fetchTimetables("tera");

		assert.equal(fetchCalls.length, 1);
		assert.equal(
			fetchCalls[0].url,
			"https://tera.edupage.org/timetable/server/ttviewer.js?__func=getTTViewerData"
		);
		assert.equal(fetchCalls[0].options.method, "POST");
		assert.deepEqual(JSON.parse(fetchCalls[0].options.body), {
			__args: [null, new Date().getFullYear()],
			__gsh: "00000000",
		});
		assert.deepEqual(result, responsePayload);
	} finally {
		globalThis.fetch = originalFetch;
	}
});
