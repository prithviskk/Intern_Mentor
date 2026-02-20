export type LeetCodeStats = {
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  recentAccepted: { title: string; titleSlug: string; timestamp: string }[];
};

const query = `
  query userProfile($username: String!) {
    matchedUser(username: $username) {
      submitStatsGlobal {
        acSubmissionNum {
          difficulty
          count
        }
      }
    }
    recentAcSubmissionList(username: $username, limit: 5) {
      title
      titleSlug
      timestamp
    }
  }
`;

export async function fetchLeetCodeStats(username: string) {
  try {
    const response = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables: { username },
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("LeetCode request failed.");
    }

    const payload = (await response.json()) as {
      data?: {
        matchedUser?: {
          submitStatsGlobal?: {
            acSubmissionNum?: { difficulty: string; count: number }[];
          };
        };
        recentAcSubmissionList?: {
          title: string;
          titleSlug: string;
          timestamp: string;
        }[];
      };
    };

    const submissions =
      payload.data?.matchedUser?.submitStatsGlobal?.acSubmissionNum ?? [];

    const map = new Map(
      submissions.map((item) => [item.difficulty, item.count])
    );

    return {
      totalSolved: map.get("All") ?? 0,
      easySolved: map.get("Easy") ?? 0,
      mediumSolved: map.get("Medium") ?? 0,
      hardSolved: map.get("Hard") ?? 0,
      recentAccepted: payload.data?.recentAcSubmissionList ?? [],
    } as LeetCodeStats;
  } catch {
    return null;
  }
}
