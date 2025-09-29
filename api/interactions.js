export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const { method } = req;
  if (method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  const body = await req.json();

  if (body.type === 1) {
    return new Response(JSON.stringify({ type: 1 }), { status: 200 });
  }

  if (body.type === 2 && body.data.name === "mr") {
    return new Response(JSON.stringify({
      type: 9,
      data: {
        custom_id: "submit_review_mr",
        title: "MR Review Request",
        components: [
          { type: 1, components: [{ type: 4, custom_id: "repo", label: "Project/Repo", style: 1, required: true }] },
          { type: 1, components: [{ type: 4, custom_id: "branch", label: "Target Branch", style: 1, value: "develop" }] },
          { type: 1, components: [{ type: 4, custom_id: "reviewers", label: "Reviewers", style: 1 }] }
        ]
      }
    }), { status: 200 });
  }

  if (body.type === 2 && body.data.name === "ac") {
    return new Response(JSON.stringify({
      type: 9,
      data: {
        custom_id: "submit_ac_review",
        title: "AC Review Booking",
        components: [
          { type: 1, components: [{ type: 4, custom_id: "scope", label: "Scope or User Story", style: 1, required: true }] },
          { type: 1, components: [{ type: 4, custom_id: "time", label: "Preferred Time", style: 1, value: "13.30" }] },
          { type: 1, components: [{ type: 4, custom_id: "participants", label: "Participants", style: 1 }] }
        ]
      }
    }), { status: 200 });
  }

  if (body.type === 5) {
    const values = {};
    for (const row of body.data.components) {
      for (const comp of row.components) {
        values[comp.custom_id] = comp.value;
      }
    }

    let content = '';
    if (body.data.custom_id === 'submit_review_mr') {
      content = `📌 **MR Review Request**\n🔗 ${values.repo}\n🎯 ${values.branch}\n👥 ${values.reviewers}`;
    } else if (body.data.custom_id === 'submit_ac_review') {
      content = `📌 **AC Review Booking**\n📖 ${values.scope}\n🕒 ${values.time}\n👥 ${values.participants}`;
    }

    return new Response(JSON.stringify({
      type: 4,
      data: {
        content: content
      }
    }), { status: 200 });
  }

  return new Response('Unhandled', { status: 400 });
}
