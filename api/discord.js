import { InteractionResponseType, verifyKey } from 'discord-interactions';

export const config = {
  runtime: 'edge',
};

export default async (req) => {
  // ตรวจ signature (ถ้าต้องการความปลอดภัย)
  const signature = req.headers.get('x-signature-ed25519');
  const timestamp = req.headers.get('x-signature-timestamp');
  const body = await req.text();

  // ถ้า verify ไม่ผ่าน
  // if (!verifyKey(body, signature, timestamp, process.env.DISCORD_PUBLIC_KEY)) {
  //   return new Response('Invalid request signature', { status: 401 });
  // }

  const interaction = JSON.parse(body);

  // ถ้าเป็น Slash Command
  if (interaction.type === 2) {
    const name = interaction.data.name;

    if (name === 'mr-review' || name === 'ac-review') {
      // สร้าง modal data
      const modal = {
        type: InteractionResponseType.MODAL,
        data: {
          custom_id: name + '_modal',
          title: name === 'mr-review' ? 'Merge Request Review' : 'AC Review Booking',
          components: [
            {
              type: 1,
              components: [
                {
                  type: 4,
                  custom_id: 'mr_link',
                  label: 'MR Link',
                  style: 1,
                  required: true,
                },
              ],
            },
            {
              type: 1,
              components: [
                {
                  type: 4,
                  custom_id: 'target_branch',
                  label: 'Target Branch',
                  style: 1,
                  required: true,
                },
              ],
            },
            {
              type: 1,
              components: [
                {
                  type: 4,
                  custom_id: 'reviewers',
                  label: 'Reviewers (optional)',
                  style: 1,
                  required: false,
                },
              ],
            },
          ],
        },
      };

      if (name === 'ac-review') {
        // ถ้าเป็น ac-review ให้เพิ่ม field เวลา
        modal.data.components.push({
          type: 1,
          components: [
            {
              type: 4,
              custom_id: 'time_slot',
              label: 'Preferred Time (ex: Thu 15:00)',
              style: 1,
              required: false,
            },
          ],
        });
      } else {
        // mr-review ให้เพิ่ม Summary field
        modal.data.components.push({
          type: 1,
          components: [
            {
              type: 4,
              custom_id: 'summary',
              label: 'Summary of changes',
              style: 2,
              required: false,
            },
          ],
        });
      }

      return new Response(JSON.stringify(modal), {
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // ถ้าเป็น submission ของ modal
  if (interaction.type === 5) {
    const customId = interaction.data.custom_id; // เช่น 'mr-review_modal' หรือ 'ac-review_modal'

    const get = (id) =>
      interaction.data.components
        .flatMap((r) => r.components)
        .find((c) => c.custom_id === id)?.value;

    const mrLink = get('mr_link');
    const branch = get('target_branch');
    const reviewers = get('reviewers') || 'N/A';

    let content = '';

    if (customId === 'mr-review_modal') {
      const summary = get('summary') || 'ไม่มี summary';
      content = `📌 **Merge Request for Review**\n\n🔗 MR Link: ${mrLink}\n🎯 Target Branch: \`${branch}\`\n👥 Reviewers: ${reviewers}\n\n📝 Summary:\n${summary}`;
    } else if (customId === 'ac-review_modal') {
      const timeslot = get('time_slot') || 'ไม่ระบุเวลา';
      content = `📅 **AC Review Booking Request**\n\n🔗 MR Link: ${mrLink}\n🎯 Target Branch: \`${branch}\`\n👥 Reviewers: ${reviewers}\n🕒 Preferred Time: ${timeslot}`;
    } else {
      content = 'Unknown modal result';
    }

    return new Response(
      JSON.stringify({
        type: 4,
        data: { content },
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  }

  // ถ้าไม่ใช่ interaction ที่รู้จัก
  return new Response('No interaction handler', { status: 200 });
};
