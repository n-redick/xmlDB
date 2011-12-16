<?php
	require_once 'forum_permissions.php';
	require_once 'thread_database.php';
	
	class Forum {
		const POSTS_PER_PAGE = 20;
		const THREADS_PER_PAGE = 20;
	
		private $database;
		private $permissions;
		
		public function __construct( ThreadDatabase $db, ForumPermissions $permissions ) {
			$this->database = $db;
			$this->permissions = $permissions;
		}
		
		private static function wrapUp($html) {
			return "<div class='content_wrapper'><div class='content_header'>Forum</div>{$html}</div>";
		}
		
		public function reply( $threadId ) {
			$thread = $this->database->getThread($threadId);
			$hook = $this->database->getHook($thread['ThreadHookID']);
			$threadLink = Forum::threadLink( $thread );
			$posts = $this->database->getPosts( $threadId, 5, 0, false );
			$pages = (int)(($thread['PostCount']-1) / Forum::POSTS_PER_PAGE + 1);
			$codes = Forum::getAvailableForumCode();
			
			$html = "
		<div class='fo_ll'>
			<div class='fo_ll_left'>
				<a class='fo_link' href='?forum'>Forum</a> &raquo; 
				<a class='fo_link' href='?forum={$hook['ID']}'>{$hook['Name']}</a> &raquo; 
				<span class='fo_ll_active'>{$threadLink}</span></div>
			<div class='fo_ll_right'></div>
		</div>
		<table cellpadding='0' cellspacing='0' class='fo_table'>
			<colgroup>
				<col width='200px' />
				<col width='750px' />
			</colgroup>";
			
			for( $i = count($posts) - 1; $i>=0; $i-- ) {
				$html .= $this->getPost( $posts[$i], $pages, $thread['PostCount'] - $i, $thread );
			}
			
			$html .= "
		</table>
		<div class='fo_nt_p'>
			<div class='fo_header fo_nt_h'>Reply</div>
			<a name='bottom' href='#'></a>
			<div class='fo_nt_inputs'>
				<form method='post' action='javascript:g_checkReply({$threadId})'>
					<div class='fo_nt_content_p'>
						<div>Reply:</div>
						<textarea class='textarea fo_nt_content' id='reply_content'></textarea>
					</div>
					<div class='fo_submit_btn_p'>
						<input class='button button_light' id='reply_submit' type='submit' value='submit' />
					</div>
				</form>
			</div>
			<div>{$codes}</div>
		</div>";
			return $this->wrapUp($html);
		}
		
		public function newThread( $hookId ) {
			$hook = $this->database->getHook($hookId);
			$codes = Forum::getAvailableForumCode();
			
			$threadTypeSelectOptions = "";
			if( $this->permissions->mayCreateStickies($hookId)) {
				$threadTypeSelectOptions .= "<option value='sticky'>Sticky</option>";
			}
			if( $this->permissions->mayCreateAnnouncements($hookId)) {
				$threadTypeSelectOptions .= "<option value='announcement'>Announcement</option>";
			}
			if( $threadTypeSelectOptions ) {
				$threadTypeSelect = "<select class='single_select fo_nt_select' id='thread_type' name='type'><option value='thread'>Thread</option>{$threadTypeSelectOptions}</select>";
			}
			else {
				$threadTypeSelect = "";
			}
			
			$html ="
			<div class='fo_nt_p'>
				<div class='fo_header fo_nt_h'>Create a new Topic</div>
				<div class='fo_nt_inputs'>
					<form id='topic_form' method='post' action='javascript:g_checkTopic({$hookId})'>
						<div>
							{$threadTypeSelect}
							<span>Title:</span>
							<input class='input fo_nt_input' id='topic_title'/>
						</div>
						<div class='fo_nt_content_p'>
							<div>Content:</div>
							<textarea class='textarea fo_nt_content' id='topic_content'></textarea>
						</div>
						<div class='fo_submit_btn_p'>
							<input class='button button_light' id='topic_submit' type='submit' value='submit' />
						</div>
					</form>
				</div>
				<div>{$codes}</div>
			</div>";
			return $this->wrapUp($html);
		}
		
		public function getForums() {
			$hooks = array(1,2,3,4,5);
			
			$html = "
		<table cellpadding='0' cellspacing='0' class='fo_table'>
			<colgroup>
				<col width='54%' />
				<col width='8%' />
				<col width='8%' />
				<col width='30%' />
			</colgroup>
			<tr>
				<td class='fo_header fo_header_first'>Forum</td>
				<td class='fo_header'>Topics</td>
				<td class='fo_header'>Posts</td>
				<td class='fo_header'>Latest Post</td>
			</tr>";
			
			for( $i=0; $i<count($hooks); $i++ ) {
				$html .= $this->getForum( $this->database->getHook($hooks[$i]), $i );
			}
			$html .= "
		</table>";
			return $this->wrapUp($html);
		}
		
		private function getForum( $hook, $index ) {
			//$new = forum_get_new_posts( 1, array($subforums[$i]['subforumId']), true );
			$style = $index % 2 == 0 ? "fo_cell_bg1" : "fo_cell_bg2";			
			
			$html ="
			<tr class='fo_row'>
				<td class='fo_cell_l {$style}'>
					<div class='fo_subforum'>
						<a class='fo_link fo_forum_link' href='?forum={$hook['ID']}'>{$hook['Name']}</a>
					</div>
				</td>
				<td class='fo_cell_m {$style}'>{$hook['ThreadCount']}</td>
				<td class='fo_cell_m {$style}'>{$hook['PostCount']}</td>
				<td class='fo_cell_r {$style}'>
					<div class='forum_last_post'>";
			/*
			if( count($new) )
			{
				$g_content .='
					<span class="forum_time">Posted '.date("M jS Y g:i A",(int)$new[0]['created']).'
					by <span class="'.$user_role_to_css_class[$new[0]['role']].'">'.$new[0]['name'].'</span></span>
					<div>'.forum_topic_link( $new[0]['flag'], $new[0]['locked'], $new[0]['topicId'], $new[0]['title'], $new[0]['posts'], $new[0]['page'], 20 ).'</div>
				';
			}
			*/
			$html .="
					</div>
				</td>
			</tr>";
			return $html;
		}
		
		public function getThreads( $forumId, $page ) {
			$hook = $this->database->getHook($forumId);
			$pages = (int)(($hook['ThreadCount']-1) / Forum::THREADS_PER_PAGE + 1);
			$page = max(min($pages,$page),1);
			$stickies = $this->database->getStickies($forumId,Forum::THREADS_PER_PAGE, max(0,$page-1) * Forum::THREADS_PER_PAGE);
			$announcements = $this->database->getAnnouncements($forumId,Forum::THREADS_PER_PAGE, max(0,$page-1) * Forum::THREADS_PER_PAGE);
			$threads = $this->database->getThreads($forumId,Forum::THREADS_PER_PAGE, max(0,$page-1) * Forum::THREADS_PER_PAGE);
			$actions = "";
			$pageBar = $this->getPageBar( "forum={$forumId}", $page, $pages );
			
			if( $this->permissions->mayCreateThreads($forumId)) {
				$actions .= "<a class='button button_light fo_header_action' href='?forum={$forumId}&newTopic'>New Topic</a>";
			}
			
			$html = "
			<div class='fo_ll'>
				<div class='fo_ll_left'>
					<a class='fo_link' href='?forum'>Forum</a>
					 &raquo; <span class='fo_ll_active'>{$hook['Name']}</span>
				</div>
				<div class='fo_ll_right'>{$actions}</div>
			</div>
			<div class='clear_both'></div>
			<table cellpadding='0' cellspacing='0' class='fo_table'>
				<colgroup>
					<col width='650px' />
					<col width='75px' />
					<col width='225px' />
				</colgroup>
				<tr>
					<td class='fo_header fo_header_first'>Topic</td>
					<td class='fo_header'>Posts</td>
					<td class='fo_header'>Latest Post</td>
				</tr>";
			if( count($announcements) > 0 ) {
				$html .= "<tr><td colspan='3'><div class='fo_thread_cat'>Announcements</div></td></tr>";
				for( $i=0; $i<count($announcements); $i++ ) {
					$html .= $this->getThread( $announcements[$i], $page, $i + 1 );
				}
			}
			if( count($stickies) > 0 ) {
				$html .= "<tr><td colspan='3'><div class='fo_thread_cat'>Stickies</div></td></tr>";
				for( $i=0; $i<count($stickies); $i++ ) {
					$html .= $this->getThread( $stickies[$i], $page, $i + 1 );
				}
			}
			$html .= "<tr><td colspan='3'><div class='fo_thread_cat'>Threads</div></td></tr>";
			for( $i=0; $i<count($threads); $i++ ) {
				$html .= $this->getThread( $threads[$i], $page, $i + 1 );
			}
			$html .= "
			</table>
			{$pageBar}";
		
			return $this->wrapUp($html);
		}
		
		private function getThread( $thread, $page, $index ) {
			$user = new user_data($thread['AuthorID']);
			$roleColorCssClass = Forum::roleToCssClass($user);
			$threadCreated = date("M jS Y g:i A",(int)$thread['Created']);
			$threadLink = Forum::threadLink( $thread );
			$pages = (int)(($thread['PostCount']-1) / Forum::POSTS_PER_PAGE + 1);
			
			$userPost = new user_data($thread['PostAuthorID']);
			$roleColorCssClassPost = Forum::roleToCssClass($userPost);
			$postCreated = date("M jS Y \a\\t  g:i A",(int)$thread['PostCreated']);
			
			$style = $index % 2 == 0 ? "fo_cell_bg1" : "fo_cell_bg2";
			
			$html = "
			<tr class='fo_row'>
				<td class='fo_cell_l {$style}'>
					<div class='fo_topic'>
						<div class='forum_additional_info'><a href='?user={$user->get_id()}' class='{$roleColorCssClass}'>{$user->get_name()}</a>, {$threadCreated}</div>
						<div>{$threadLink}</div>
					</div>
				</td>
				<td class='fo_cell_m {$style}'>{$thread['PostCount']}</td>
				<td class='fo_cell_r {$style}'>
					<div class='forum_last_post'>
						<span class='forum_time'>Posted {$postCreated }
						<br />by </span><span class='{$roleColorCssClassPost}'>{$userPost->get_name()}</span>
						<a class='forum_goto_link' href='?thread={$thread['ID']}&amp;page={$pages}#post-{$thread['PostCount']}'>&raquo;</a>
					</div>	
				</td>
			</tr>";
			return $html;
		}
		
		public function getPosts( $threadId, $page, $editPostId = 0 ) {
			$thread = $this->database->getThread($threadId);
			$pages = (int)(($thread['PostCount']-1) / Forum::POSTS_PER_PAGE + 1);
			$page = max(min($pages,$page),1);
			$posts = $this->database->getPosts( $threadId, Forum::POSTS_PER_PAGE, max(0,$page-1) * Forum::POSTS_PER_PAGE );
			$hook = $this->database->getHook($thread['ThreadHookID']);
			$threadLink = Forum::threadLink( $thread );
			$pageBar = $this->getPageBar( "thread={$threadId}", $page, $pages );
			
			$actions = "";
			
			if( $this->permissions->mayDeleteAnyThreads($thread['ThreadHookID']) ) {
				$actions = "<a class='button button_light fo_header_action' href='javascript:g_deleteThread({$threadId})'>Delete</a>";
			}
			if( $this->permissions->mayPost()) {
				$actions .= "<a class='button button_light fo_header_action' href='?thread={$threadId}&reply#bottom'>Reply</a>";
			}
			
			$html = "
		<div class='fo_ll'>
			<div class='fo_ll_left'>
				<a class='fo_link' href='?forum'>Forum</a> &raquo; 
				<a class='fo_link' href='?forum={$hook['ID']}'>{$hook['Name']}</a> &raquo; 
				<span class='fo_ll_active'>{$threadLink}</span></div>
			<div class='fo_ll_right'>{$actions}</div>
		</div>
		<table cellpadding='0' cellspacing='0' class='fo_table'>
			<colgroup>
				<col width='200px' />
				<col width='750px' />
			</colgroup>";
			
			for( $i=0; $i<count($posts); $i++ ) {
				$html .= $this->getPost( $posts[$i], $page, ($page-1) * Forum::POSTS_PER_PAGE + $i + 1, $thread, $editPostId );
			}
			
			$html .= "
		</table>
		{$pageBar}";
			
			return $this->wrapUp($html);
		}
		
		private function getPageBar( $urlBase, $page, $pages ) {
			$lastPageLink = "";
			$firstPageLink = "";
			$previousPageLink = "";
			$nextPageLink = "";
			if( $page > 1 ) {
				if( $page > 2) {	
					$firstPageLink = "<a class='button button_light link_button fo_jump' href='?{$urlBase}&amp;page=1'>&laquo; First</a>";
				}
				$previousPageLink = "<a class='button button_light link_button' href='?{$urlBase}&amp;page=".($page-1)."'>&lsaquo; Previous</a>";
			}
			if( $page < $pages ) {
				$nextPageLink = "<a class='button button_light link_button' href='?{$urlBase}&amp;page=".($page+1)."'>Next &rsaquo;</a>";
				if( $page < $pages - 1 ) {	
					$lastPageLink = "<a class='button button_light link_button fo_jump' href='?{$urlBase}&amp;page={$pages}'>Last &raquo;</a>";
				}
			}
			return "
					<table class='fo_page'><colgroup><col width='50%'/><col width='0%'/><col width='50%'/></colgroup>
						<tr>
							<td class='fo_pl_l'>{$previousPageLink}{$firstPageLink}</td>
							<td class='fo_pl_c'>{$page}&nbsp;of&nbsp;{$pages}</td>
							<td class='fo_pl_r'>{$lastPageLink}{$nextPageLink}</td>
						</tr>
					</table>";
		}
		
		private function getPost( $post, $page, $threadIndex, $thread, $editPostId = 0 ) {
			$user = new user_data($post['AuthorID']);
			$date = date("M jS Y \a\\t  g:i A",(int)$post['Created']);
			$userPosts = $this->database->getPostCountFor($post['AuthorID']);
			$userJoined = date("M jS Y",(int)$user->get_joined());
			$roleColorCssClass = Forum::roleToCssClass($user);
			$mods = "";
			
			if( $post['ModCount'] > 0 ) {
				$times = $post['ModCount'] > 1 ? $post['ModCount'].' times, last ' : 'once, on ';
				$mods = "<div class='fo_post_mods'>Modified {$times}".date("M jS Y \a\\t  g:i A",(int)$post['LastCreated'])."</div>";
			}
			
			if( $editPostId == $post['ID'] ) {
				$content = "
				<form method='post' id='edit_form' action='javascript:g_checkEdit({$post['ID']})'>
					<textarea id='edit_content' class='textarea fo_edit' rows='10' cols='60'>{$post['Plain']}</textarea>
					<div class='fo_submit_btn_p'>
						<input class='button button_light' id='edit_submit' type='submit' value='submit' />
					</div>
				</form>";
			}
			else {
				$content = $post['Parsed'];
			}
			/*
			if( $editPostId == 0 ) {
				$arr = htmlspecialchars(json_encode(array( "PostID" => $post['ID'], "Data" => array( "PlainContent" => $plain, "ParsedContent" => $parsed ))), ENT_QUOTES);
				$onclick = "onclick='g_makePostEditable({$arr})'";
			}
			*/
			
			$sig = $user->get_forum_signature();
			if( $sig ) {
				$signature = "
					<div class='fo_sig_spacer'></div>
					<div class='fo_signature'>{$sig}</div>
				";
			}
			else {
				$signature = "";
			}
			
			$avt = $user->get_avatar();
			if( $avt ) {
				$avatar = "<img class='forum_avatar' src='images/icons/large/{$user->get_avatar()}.png' />";
			}
			else {
				$avatar = "";
			}
			
			$actions = "";
			if( $this->permissions->mayEditPostsFrom($post['AuthorID'], $thread['ThreadHookID']) ) {
				$actions = "<a class='fo_post_header_action' href='?thread={$thread['ID']}&page={$page}&edit={$post['ID']}#{$threadIndex}'>Edit</a>";
			}
			
			return "
			<tr class='fo_post_header'>
				<td class='fo_post_header_first'>
					<a class='forum_post_anchor' name='{$threadIndex}' href='?thread={$thread['ID']}&amp;page={$page}#{$threadIndex}'>
						#{$threadIndex}
					</a>
				</td>
				<td class='fo_post_header_last'>
					<span class='forum_post_time'>
						Posted {$date}
					</span>
					{$actions}
				</td>
			</tr>
			<tr>
				<td rowspan='2' class='forum_user_info' valign='top'>
					<div class='fo_user_name {$roleColorCssClass}'>
						<a class='fo_user_link' href='?user={$user->get_id()}'>{$user->get_name()}</a>
					</div>
					<div>{$avatar}</div>
					<div class='fo_user_add_info'>
						joined {$userJoined}<br>
						Posts: {$userPosts}
					</div>
				</td>
				<td valign='top' class='fo_content_p'>
					<div id='p{$post['ID']}_content' class='forum_content {$roleColorCssClass}'>{$content}{$mods}</div>
				</td>
			</tr>
			<tr>
				<td class='fo_signature_p' valign='bottom'>
					{$signature}
				</td>
			</tr>";
		}
		
		private static function roleToCssClass( user_data $user ) {
			return $user->is_admin() ? 'forum_author_admin' : '';
		}
		
		public static function getAvailableForumCode() {
			
			$codes = array(
				"Links" => array( "[url]http://example.org[/url]", "[url=http://example.org]click here[/url]"),
				"Images" => array( "[img]http://chardev.org/images/favico.png[/img]"),
				"Text" => array( "[i]underline[/i]", "[b]italic[/b]", "[u]bold[/u]"),
				"Items" => array( "[item]192[/item]", "http://www.wowhead.com/item=13385")
			);
			
			$html = "";
			
			foreach( $codes as $k => $v ) {
				$plain = "";
				$parsed = "";
				for( $i=0; $i<count($v); $i++ ) {
					$str = ThreadDatabase::replaceCode($v[$i]);
					$plain .= "<div class='fo_code_plain'>{$v[$i]}</div>";
					$parsed .= "<div class='fo_code_parsed'>{$str}</div>";
				}
				$html .= "
					<tr>
						<td class='fo_code_td' valign='top'>
							<div class='fo_code_name'>{$k}</div>
						</td>
						<td class='fo_code_td'>{$plain}</td>
						<td class='fo_code_td'>{$parsed}</td>
					</tr>";
			}
		
			return "<div class='fo_code_p'>
				<div class='fo_code_h'>Availabe Codes</div>
				<table class='fo_code_tab' cellpadding='0' cellspacing='0'>
					{$html}
				</table>
			</div>";
		}
		
		private static function threadLink( $thread, $max_length = 50 )
		{
			$title = shorten(htmlspecialchars_decode($thread['Title'],ENT_QUOTES),$max_length);
			$cssClass = "";
			if( $thread['Flag'] & ThreadDatabase::FLAG_THREAD_STICKY )  {
				$cssClass = "forum_topic_sticky_link";
			}
			else if( $thread['Flag'] & ThreadDatabase::FLAG_THREAD_ANNOUNCEMENT ) {
				$cssClass = "forum_topic_announcement_link";
			}
			
			return 	"<a 
						title='{$thread['Title']}' 
						class='fo_link {$cssClass}' 
						href='?thread={$thread['ID']}'
					>
						{$title}
					</a>";
		}
	}
?>